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

// Assinar uma operação
router.post('/sign', async (req, res) => {
  try {
    const { projectId, operationId, operatorName, startTime, endTime, measurement, notes } = req.body;
    console.log('[DEBUG] Dados recebidos:', { projectId, operationId, operatorName });
    
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
    
    console.log('[DEBUG] Projeto encontrado:', project._id);
    
    // Agora buscar e atualizar a operação diretamente na coleção operations
    let operationFilter;
    if (typeof operationId === 'number') {
      operationFilter = { 
        projectId: project._id,
        id: operationId 
      };
    } else {
      operationFilter = { 
        projectId: project._id,
        sequence: String(operationId) 
      };
    }
    
    const result = await db.collection('operations').updateOne(
      operationFilter,
      {
        $set: {
          completed: true,
          signedBy: operatorName,
          timestamp: new Date(),
          inspectionNotes: notes,
          timeRecord: {
            start: startTime ? new Date(startTime) : null,
            end: endTime ? new Date(endTime) : null
          },
          measurementValue: measurement
        }
      }
    );
    
    console.log('[DEBUG] Resultado do update:', result);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Operação não encontrada no projeto' });
    }
    
    res.json({ success: true, message: 'Operação assinada com sucesso' });
  } catch (error) {
    console.error('Erro ao assinar operação:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
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