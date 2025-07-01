const express = require('express');
const router = express.Router();
const { connect } = require('../db/mongodb');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const db = await connect();
    const projects = await db.collection('projects').find({}).sort({ createdAt: -1 }).toArray();
    res.json(projects);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro ao buscar projetos', details: error.message });
  }
});

// GET /api/projects/with-operations
router.get('/with-operations', async (req, res) => {
  try {
    const db = await connect();
    const { machine } = req.query;
    
    // Buscar todos os projetos ou filtrar por máquina
    const projectFilter = machine ? { machine: machine } : {};
    const projects = await db.collection('projects').find(projectFilter).sort({ createdAt: -1 }).toArray();
    
    // Para cada projeto, buscar suas operações
    const projectsWithOperations = await Promise.all(
      projects.map(async (project) => {
        try {
          const operations = await db.collection('operations')
            .find({ projectId: project._id })
            .sort({ sequence: 1 })
            .toArray();
          return {
            ...project,
            operations: operations
          };
        } catch (error) {
          console.error(`Erro ao buscar operações do projeto ${project._id}:`, error);
          return {
            ...project,
            operations: []
          };
        }
      })
    );
    
    res.json(projectsWithOperations);
  } catch (error) {
    console.error('Erro ao buscar projetos com operações:', error);
    res.status(500).json({ error: 'Erro ao buscar projetos com operações', details: error.message });
  }
});

// GET /api/projects/with-operations/:id
router.get('/with-operations/:id', async (req, res) => {
  try {
    const db = await connect();
    const { id } = req.params;
    const project = await db.collection('projects').findOne({ projectId: id });
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    const operations = await db.collection('operations').find({ projectId: project._id }).toArray();
    res.json({ ...project, operations });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar projeto com operações', details: error.message });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    console.log('Dados recebidos do projeto:', req.body);
    const db = await connect();
    console.log('Conexão com banco estabelecida');
    
    // Validar campos obrigatórios
    if (!req.body.projectId || !req.body.name || !req.body.machine) {
      return res.status(400).json({ error: 'Campos obrigatórios: projectId, name, machine' });
    }
    
    // Verificar se já existe um projeto com o mesmo projectId
    const existingProject = await db.collection('projects').findOne({ projectId: req.body.projectId });
    if (existingProject) {
      return res.status(409).json({ error: 'Já existe um projeto com este ID' });
    }
    
    // Adicionar timestamps automáticos e converter date para Date
    const projectData = {
      ...req.body,
      date: new Date(req.body.date), // Converter string para Date
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('projects').insertOne(projectData);
    console.log('Projeto inserido com sucesso:', result);
    
    // Retornar o projeto criado
    const createdProject = await db.collection('projects').findOne({ _id: result.insertedId });
    res.status(201).json(createdProject);
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ error: 'Erro ao criar projeto', details: error.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  try {
    const db = await connect();
    const { id } = req.params;
    
    // Primeiro tentar atualizar por _id (ObjectId)
    let result = await db.collection('projects').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    
    // Se não encontrou por _id, tentar por projectId
    if (result.matchedCount === 0) {
      result = await db.collection('projects').updateOne(
        { projectId: id },
        { $set: { ...req.body, updatedAt: new Date() } }
    );
    }
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar projeto', details: error.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await connect();
    const { id } = req.params;
    
    // Primeiro tentar deletar por _id (ObjectId)
    let result = await db.collection('projects').deleteOne({ _id: new ObjectId(id) });
    
    // Se não encontrou por _id, tentar por projectId
    if (result.deletedCount === 0) {
      result = await db.collection('projects').deleteOne({ projectId: id });
    }
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover projeto', details: error.message });
  }
});

// Finalizar um projeto
router.post('/finish', async (req, res) => {
  try {
    const { projectId } = req.body;
    console.log('[DEBUG] Finalizando projeto:', projectId);
    
    if (!projectId) {
      return res.status(400).json({ error: 'projectId é obrigatório' });
    }
    
    const db = await connect();
    
    // Buscar o projeto
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
    
    // Verificar operações (apenas para log, não para bloquear)
    const operations = await db.collection('operations').find({ projectId: project._id }).toArray();
    const incompleteOperations = operations.filter(op => !op.completed);
    
    if (incompleteOperations.length > 0) {
      console.log('[DEBUG] Operações incompletas encontradas:', incompleteOperations.length);
      console.log('[DEBUG] Permitindo finalização mesmo com operações pendentes');
    }
    
    // Atualizar o projeto para finalizado
    const now = new Date();
    const updateData = {
      status: 'completed',
      completedDate: now,
      updatedAt: now
    };
    
    console.log('[DEBUG] Dados de atualização do projeto:', updateData);
    
    const result = await db.collection('projects').updateOne(
      { _id: project._id },
      { $set: updateData }
    );
    
    console.log('[DEBUG] Resultado do update do projeto:', result);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado para atualização' });
    }
    
    // Criar log da finalização do projeto
    try {
      await db.collection('projectLogs').insertOne({
        projectId: project._id,
        action: 'finish',
        timestamp: now,
        details: {
          previousStatus: project.status,
          newStatus: 'completed',
          totalOperations: operations.length,
          completedOperations: operations.filter(op => op.completed).length
        }
      });
      console.log('[DEBUG] Log de finalização do projeto criado com sucesso');
    } catch (logError) {
      console.error('[DEBUG] Erro ao criar log de finalização:', logError);
      // Não falhar se o log não puder ser criado
    }
    
    res.json({ 
      success: true, 
      message: 'Projeto finalizado com sucesso',
      projectId: project._id,
      completedDate: now
    });
  } catch (error) {
    console.error('Erro ao finalizar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

// POST /api/projects/import-pdf-project
router.post('/import-pdf-project', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  let data;
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    data = await pdfParse(dataBuffer);
    fs.unlinkSync(req.file.path);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao ler PDF', details: err.message });
  }

  // Função de parsing (copiada/adaptada de pdfToJsonApi.js)
  function parsePdfTextToJson(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const projeto = {
      nome: '', material: '', programador: '', tempoProjeto: '', dataImpressao: '', pastaProgramas: '', pastaProjetoPowermill: ''
    };
    for (let i = lines.length - 1; i >= 0; i--) {
      if (!projeto.nome && lines[i].startsWith('Projecto')) projeto.nome = lines[i].replace(/^Projecto\s*/i, '').replace(':', '').trim();
      if (!projeto.material && lines[i].startsWith('Material:')) projeto.material = lines[i].replace('Material:', '').trim();
      if (!projeto.dataImpressao && lines[i].includes('Data:')) projeto.dataImpressao = lines[i].split('Data:')[1].trim();
      if (!projeto.pastaProgramas && lines[i].startsWith('Pasta dos Programas:')) projeto.pastaProgramas = lines[i].replace('Pasta dos Programas:', '').trim();
      if (!projeto.pastaProjetoPowermill && lines[i].startsWith('Pasta do Projeto Powermill:')) projeto.pastaProjetoPowermill = lines[i].replace('Pasta do Projeto Powermill:', '').trim();
      if (!projeto.programador && lines[i].startsWith('Programador:')) {
        const parts = lines[i].replace('Programador:', '').split('Tempo Projeto:');
        projeto.programador = parts[0].trim();
        projeto.tempoProjeto = (parts[1] || '').trim();
      }
    }
    // NOVO: Se não encontrou nome do projeto, extrair do final da pasta
    if (!projeto.nome) {
      let pasta = projeto.pastaProgramas || projeto.pastaProjetoPowermill;
      if (pasta) {
        const partes = pasta.split(/[\\\/]/); // separa por / ou \
        projeto.nome = partes[partes.length - 1].trim();
      }
    }
    // NOVO: Inferir máquina do nome do projeto se padrão F1400_, F1600_, etc
    let maquina = '';
    if (projeto.nome) {
      const match = projeto.nome.match(/^(F\d{4})[_-]/i);
      if (match) {
        maquina = match[1];
      }
    }
    const operacoes = [];
    let i = 0;
    while (i < lines.length) {
      if (/^\d{2}$/.test(lines[i])) {
        const numero = lines[i];
        const tipo = lines[i+1] || '';
        const observacao = lines[i+2] || '';
        let parametros = [];
        let j = i+3;
        while (j < lines.length && !/^\d{2}$/.test(lines[j]) && !lines[j].startsWith('Fresa:') && !lines[j].startsWith('Sup.:')) {
          parametros.push(lines[j]);
          j++;
        }
        let ferramenta = '';
        let suporte = '';
        if (lines[j] && lines[j].startsWith('Fresa:')) { ferramenta = lines[j+1] || ''; j += 2; }
        if (lines[j] && lines[j].startsWith('Sup.:')) { suporte = lines[j+1] || ''; j += 2; }
        operacoes.push({ numero, tipo, observacao, parametros: parametros.join(' '), ferramenta: ferramenta.trim(), suporte: suporte.trim() });
        i = j;
      } else { i++; }
    }
    return { projeto, operacoes, maquina };
  }

  // Parsear texto extraído
  const parsed = parsePdfTextToJson(data.text);
  console.log('[IMPORT PDF] Resultado do parser:', JSON.stringify(parsed, null, 2));
  if (parsed.operacoes) {
    console.log(`[IMPORT PDF] Operações extraídas: ${parsed.operacoes.length}`);
    parsed.operacoes.forEach((op, idx) => {
      console.log(`[IMPORT PDF] Operação ${idx + 1}:`, op);
    });
  }
  // Validar campos obrigatórios do projeto
  if (!parsed.projeto.nome) return res.status(400).json({ error: 'Nome do projeto não encontrado no PDF' });
  if (!parsed.projeto.dataImpressao) return res.status(400).json({ error: 'Data do projeto não encontrada no PDF' });

  try {
    const db = await connect();
    // Verificar se já existe projeto
    const projectId = parsed.projeto.nome.replace(/\s+/g, '_');
    const existing = await db.collection('projects').findOne({ projectId });
    if (existing) return res.status(409).json({ error: 'Já existe um projeto com este nome extraído do PDF' });
    // Tentar pegar a máquina do PDF, senão do frontend (req.body.machine ou req.query.machine)
    let machine = parsed.maquina || '';
    if (!machine) {
      machine = req.body?.machine || req.query?.machine || '';
    }
    // Criar projeto
    const projectDoc = {
      projectId,
      name: parsed.projeto.nome,
      machine,
      date: new Date(parsed.projeto.dataImpressao),
      material: parsed.projeto.material,
      programador: parsed.projeto.programador,
      tempoProjeto: parsed.projeto.tempoProjeto,
      pastaProgramas: parsed.projeto.pastaProgramas,
      pastaProjetoPowermill: parsed.projeto.pastaProjetoPowermill,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('projects').insertOne(projectDoc);
    const projectDb = await db.collection('projects').findOne({ _id: result.insertedId });
    // Criar operações
    const operations = parsed.operacoes.map((op, idx) => {
      // Garantir que type seja apenas 'Furação' ou 'Fresamento'
      let type = '';
      if (/fura/i.test(op.tipo)) type = 'Furação';
      else if (/fres/i.test(op.tipo)) type = 'Fresamento';
      else type = 'Furação'; // fallback

      // function: usar observacao ou tipo original
      let func = op.observacao || op.tipo || '';

      return {
        projectId: projectDb._id,
        sequence: op.numero || String(idx + 1),
        type,
        function: func,
        centerPoint: '', // não vem do PDF
        toolRef: op.ferramenta || '',
        ic: '',
        alt: '',
        time: { machine: '', total: '' },
        details: { depth: '', speed: '', feed: '', coolant: '', notes: op.parametros || '' },
        quality: { tolerance: '', surfaceFinish: '', requirements: [] },
        imageUrl: '',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
    if (operations.length > 0) {
      try {
        await db.collection('operations').insertMany(operations);
      } catch (opErr) {
        console.error('[IMPORT PDF] Erro ao inserir operações:', opErr);
        return res.status(500).json({ error: 'Erro ao inserir operações', details: opErr && opErr.message ? opErr.message : opErr });
      }
    }
    res.status(201).json({ success: true, project: projectDb, operationsCount: operations.length });
  } catch (err) {
    console.error('[IMPORT PDF] Erro geral ao criar projeto/operacoes:', err);
    res.status(500).json({ error: 'Erro ao criar projeto/operacoes', details: err && err.message ? err.message : err });
  }
});

module.exports = router; 