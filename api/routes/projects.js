const express = require('express');
const router = express.Router();
const { connect } = require('../db/mongodb');
const { ObjectId } = require('mongodb');

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const db = await connect();
    const projects = await db.collection('projects').find({}).toArray();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar projetos', details: error.message });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    console.log('Dados recebidos do projeto:', req.body);
    const db = await connect();
    console.log('Conexão com banco estabelecida');
    
    // Adicionar timestamps automáticos e converter date para Date
    const projectData = {
      ...req.body,
      date: new Date(req.body.date), // Converter string para Date
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('projects').insertOne(projectData);
    console.log('Projeto inserido com sucesso:', result);
    res.status(201).json(result.ops ? result.ops[0] : projectData);
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
    await db.collection('projects').updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );
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
    await db.collection('projects').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover projeto', details: error.message });
  }
});

module.exports = router; 