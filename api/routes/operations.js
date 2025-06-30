const express = require('express');
const router = express.Router();
const { connect } = require('../db/mongodb');
const { ObjectId } = require('mongodb');

// GET /api/operations
router.get('/', async (req, res) => {
  try {
    const db = await connect();
    const operations = await db.collection('operations').find({}).toArray();
    res.json(operations);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar operações', details: error.message });
  }
});

// POST /api/operations
router.post('/', async (req, res) => {
  try {
    const db = await connect();
    const result = await db.collection('operations').insertOne(req.body);
    res.status(201).json(result.ops ? result.ops[0] : req.body);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar operação', details: error.message });
  }
});

// PUT /api/operations/:id
router.put('/:id', async (req, res) => {
  try {
    const db = await connect();
    const { id } = req.params;
    await db.collection('operations').updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar operação', details: error.message });
  }
});

// DELETE /api/operations/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await connect();
    const { id } = req.params;
    await db.collection('operations').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover operação', details: error.message });
  }
});

// Lista dos campos da folha de processo
const PROCESS_FIELDS = [
  'Programa',
  'Tipo Percurso',
  'Ref.',
  'Comentário',
  'Ø RC',
  'Ferramenta',
  'Rib.',
  'Alt.',
  'Z min',
  'Lat.2D',
  'Sob. Esp.',
  'Passo Lat.',
  'Passo Vert.',
  'Tol.',
  'Rot.',
  'Av.',
  'Ângulo',
  'Plano Trab.',
  'Tempo Corte',
  'Tempo Total',
  'Medição',
  'Rubrica',
  'Fresa',
  'Sup.'
];

// Atualizar campos de uma operação (sem marcar como completada)
router.post('/update', async (req, res) => {
  try {
    const { projectId, operationId, operatorName, startTime, endTime, measurement, notes, ...rest } = req.body;
    console.log('[DEBUG] Dados recebidos para atualização:', { 
      projectId, 
      operationId, 
      operatorName, 
      startTime, 
      endTime, 
      measurement 
    });
    
    const db = await connect();
    
    // Primeiro, encontrar o projeto para verificar se existe
    let projectFilter;
    if (ObjectId.isValid(projectId)) {
      projectFilter = { _id: new ObjectId(projectId) };
    } else {
      projectFilter = { projectId: projectId };
    }
    
    const project = await db.collection('projects').findOne(projectFilter);
    if (!project) {
      console.log('[DEBUG] Projeto não encontrado com filtro:', projectFilter);
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    console.log('[DEBUG] Projeto encontrado:', project._id, 'ProjectId:', project.projectId);
    
    // Buscar a operação usando diferentes critérios
    let operationFilter;
    
    // Tentar primeiro por ID numérico
    if (typeof operationId === 'number') {
      operationFilter = { 
        projectId: project._id,
        id: operationId 
      };
    } else {
      // Tentar por sequence (string)
      operationFilter = { 
        projectId: project._id,
        sequence: String(operationId) 
      };
    }
    
    console.log('[DEBUG] Buscando operação com filtro:', operationFilter);
    
    // Primeiro, vamos ver quais operações existem para este projeto
    const allOperations = await db.collection('operations').find({ projectId: project._id }).toArray();
    console.log('[DEBUG] Operações encontradas para o projeto:', allOperations.length);
    allOperations.forEach(op => {
      console.log('[DEBUG] Operação:', { id: op.id, sequence: op.sequence, _id: op._id });
    });
    
    // Tentar encontrar a operação específica
    let operation = await db.collection('operations').findOne(operationFilter);
    
    // Se não encontrou, tentar outras abordagens
    if (!operation) {
      console.log('[DEBUG] Operação não encontrada com filtro inicial, tentando alternativas...');
      
      // Tentar por _id se operationId for um ObjectId válido
      if (ObjectId.isValid(operationId)) {
        operationFilter = { _id: new ObjectId(operationId) };
        operation = await db.collection('operations').findOne(operationFilter);
        console.log('[DEBUG] Tentativa por _id:', operationFilter, 'Resultado:', !!operation);
      }
      
      // Se ainda não encontrou, tentar por qualquer campo que contenha o operationId
      if (!operation) {
        operationFilter = { 
          projectId: project._id,
          $or: [
            { id: operationId },
            { sequence: String(operationId) },
            { sequence: operationId }
          ]
        };
        operation = await db.collection('operations').findOne(operationFilter);
        console.log('[DEBUG] Tentativa por $or:', operationFilter, 'Resultado:', !!operation);
      }
    }
    
    if (!operation) {
      console.log('[DEBUG] Operação não encontrada após todas as tentativas');
      return res.status(404).json({ 
        error: 'Operação não encontrada no projeto',
        debug: {
          projectId: project._id,
          operationId: operationId,
          availableOperations: allOperations.map(op => ({ id: op.id, sequence: op.sequence }))
        }
      });
    }
    
    console.log('[DEBUG] Operação encontrada:', operation._id);
    
    // Preparar dados de atualização (sem marcar como completada)
    const updateData = {
      updatedAt: new Date()
    };
    
    // Adicionar campos já existentes
    if (operatorName !== undefined) {
      updateData.signedBy = operatorName;
    }
    if (notes !== undefined) {
      updateData.inspectionNotes = notes;
    }
    if (measurement !== undefined) {
      updateData.measurementValue = measurement;
    }
    
    // Adicionar timeRecord apenas se ambos os horários forem fornecidos
    if (startTime && endTime) {
      updateData.timeRecord = {
        start: startTime,
        end: endTime
      };
    } else if (startTime) {
      updateData.timeRecord = {
        ...operation.timeRecord,
        start: startTime
      };
    } else if (endTime) {
      updateData.timeRecord = {
        ...operation.timeRecord,
        end: endTime
      };
    }
    
    // Adicionar campos da folha de processo se enviados
    for (const field of PROCESS_FIELDS) {
      if (rest[field] !== undefined) {
        updateData[field] = rest[field];
      }
    }
    
    console.log('[DEBUG] Dados de atualização:', updateData);
    
    const result = await db.collection('operations').updateOne(
      { _id: operation._id },
      { $set: updateData }
    );
    
    console.log('[DEBUG] Resultado do update:', result);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Operação não encontrada para atualização' });
    }
    
    // Criar log da operação
    try {
      await db.collection('operationLogs').insertOne({
        projectId: project._id,
        operationId: operation._id,
        operatorName: operatorName || operation.signedBy,
        startTime: startTime,
        endTime: endTime,
        measurement: measurement,
        notes: notes,
        timestamp: new Date(),
        action: 'update'
      });
      console.log('[DEBUG] Log de operação criado com sucesso');
    } catch (logError) {
      console.error('[DEBUG] Erro ao criar log:', logError);
      // Não falhar se o log não puder ser criado
    }
    
    res.json({ 
      success: true, 
      message: 'Operação atualizada com sucesso',
      operationId: operation._id
    });
  } catch (error) {
    console.error('Erro ao atualizar operação:', error);
    if (error.errInfo) {
      console.error('Detalhes do erro de validação:', JSON.stringify(error.errInfo, null, 2));
      res.status(500).json({ error: 'Erro interno do servidor', details: error.message, validation: error.errInfo });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
  }
});

// Assinar uma operação
router.post('/sign', async (req, res) => {
  try {
    const { projectId, operationId, operatorName, startTime, endTime, measurement, notes } = req.body;
    console.log('[DEBUG] Dados recebidos para assinatura:', { 
      projectId, 
      operationId, 
      operatorName, 
      startTime, 
      endTime, 
      measurement 
    });
    
    const db = await connect();
    
    // Buscar o projeto pelo projectId (string) ou _id
    let projectFilter;
    if (ObjectId.isValid(projectId)) {
      projectFilter = { _id: new ObjectId(projectId) };
    } else {
      projectFilter = { projectId: projectId };
    }
    
    const project = await db.collection('projects').findOne(projectFilter);
    if (!project) {
      console.log('[DEBUG] Projeto não encontrado com filtro:', projectFilter);
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    const projectIdStr = project._id.toString();
    console.log('[DEBUG] Projeto encontrado:', project._id, 'ProjectId:', project.projectId);
    
    // Buscar a operação usando sempre projectId como string
    let operationFilter;
    if (typeof operationId === 'number') {
      operationFilter = { 
        projectId: projectIdStr,
        id: operationId 
      };
    } else {
      operationFilter = { 
        projectId: projectIdStr,
        sequence: String(operationId) 
      };
    }
    
    console.log('[DEBUG] Buscando operação com filtro:', operationFilter);
    
    // Buscar todas as operações do projeto
    const allOperations = await db.collection('operations').find({ projectId: projectIdStr }).toArray();
    console.log('[DEBUG] Operações encontradas para o projeto:', allOperations.length);
    allOperations.forEach(op => {
      console.log('[DEBUG] Operação:', { id: op.id, sequence: op.sequence, _id: op._id, projectId: op.projectId });
    });
    
    // Tentar encontrar a operação específica
    let operation = await db.collection('operations').findOne(operationFilter);
    
    // Se não encontrou, tentar outras abordagens
    if (!operation) {
      console.log('[DEBUG] Operação não encontrada com filtro inicial, tentando alternativas...');
      if (ObjectId.isValid(operationId)) {
        operationFilter = { _id: new ObjectId(operationId) };
        operation = await db.collection('operations').findOne(operationFilter);
        console.log('[DEBUG] Tentativa por _id:', operationFilter, 'Resultado:', !!operation);
      }
      if (!operation) {
        operationFilter = { 
          projectId: projectIdStr,
          $or: [
            { id: operationId },
            { sequence: String(operationId) },
            { sequence: operationId }
          ]
        };
        operation = await db.collection('operations').findOne(operationFilter);
        console.log('[DEBUG] Tentativa por $or:', operationFilter, 'Resultado:', !!operation);
      }
    }
    
    if (!operation) {
      console.log('[DEBUG] Operação não encontrada após todas as tentativas');
      return res.status(404).json({ 
        error: 'Operação não encontrada no projeto',
        debug: {
          projectId: project._id,
          operationId: operationId,
          availableOperations: allOperations.map(op => ({ id: op.id, sequence: op.sequence, projectId: op.projectId }))
        }
      });
    }
    
    console.log('[DEBUG] Operação encontrada:', operation._id);
    
    // Forçar conversão dos campos problemáticos
    let forcedUpdate = {};
    if (typeof operation.projectId === 'string' && ObjectId.isValid(operation.projectId)) {
      forcedUpdate.projectId = new ObjectId(operation.projectId);
    }
    if (operation.createdAt && typeof operation.createdAt === 'string') {
      forcedUpdate.createdAt = new Date(operation.createdAt);
    }
    if (operation.updatedAt && typeof operation.updatedAt === 'string') {
      forcedUpdate.updatedAt = new Date(operation.updatedAt);
    }
    if (Object.keys(forcedUpdate).length > 0) {
      await db.collection('operations').updateOne(
        { _id: operation._id },
        { $set: forcedUpdate }
      );
      Object.assign(operation, forcedUpdate);
    }
    // Atualizar a operação
    const updateData = {
      completed: true,
      signedBy: operatorName,
      timestamp: new Date(),
      inspectionNotes: notes || '',
      measurementValue: measurement
    };
    let updateQuery;
    if (startTime && endTime) {
      updateData.timeRecord = {
        start: new Date(startTime),
        end: new Date(endTime)
      };
      updateQuery = { $set: updateData };
    } else {
      updateQuery = { $set: updateData, $unset: { timeRecord: "" } };
    }
    
    console.log('[DEBUG] Dados de atualização:', updateQuery);
    
    const result = await db.collection('operations').updateOne(
      { _id: operation._id },
      updateQuery
    );
    
    console.log('[DEBUG] Resultado do update:', result);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Operação não encontrada para atualização' });
    }
    
    // Criar log da operação
    try {
      await db.collection('operationLogs').insertOne({
        projectId: project._id,
        operationId: operation._id,
        operatorName: operatorName,
        startTime: startTime,
        endTime: endTime,
        measurement: measurement,
        notes: notes,
        timestamp: new Date(),
        action: 'sign'
      });
      console.log('[DEBUG] Log de operação criado com sucesso');
    } catch (logError) {
      console.error('[DEBUG] Erro ao criar log:', logError);
      // Não falhar se o log não puder ser criado
    }
    
    res.json({ 
      success: true, 
      message: 'Operação assinada com sucesso',
      operationId: operation._id
    });
  } catch (error) {
    console.error('Erro ao assinar operação:', error);
    if (error.errInfo) {
      console.error('Detalhes do erro de validação:', JSON.stringify(error.errInfo, null, 2));
      res.status(500).json({ error: 'Erro interno do servidor', details: error.message, validation: error.errInfo });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
  }
});

// GET /api/projects/with-operations/:id
router.get('/with-operations/:id', async (req, res) => {
  try {
    const db = await connect();
    const { id } = req.params;
    // Buscar tanto por projectId (string) quanto por _id (ObjectId)
    let project = await db.collection('projects').findOne({ projectId: id });
    if (!project && ObjectId.isValid(id)) {
      project = await db.collection('projects').findOne({ _id: new ObjectId(id) });
    }
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    const operations = await db.collection('operations').find({ projectId: project._id }).toArray();
    res.json({ ...project, operations });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar projeto com operações', details: error.message });
  }
});

module.exports = router; 