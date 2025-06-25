const express = require('express');
const router = express.Router();
const { connect } = require('../db/mongodb');
const { ObjectId } = require('mongodb');

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

module.exports = router; 