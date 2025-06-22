const express = require('express');
const router = express.Router();
const { connect } = require('../db/mongodb');
const { ObjectId } = require('mongodb');

// GET /api/machines
router.get('/', async (req, res) => {
  try {
    const db = await connect();
    const machines = await db.collection('machines').find({}).toArray();
    res.json(machines);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar máquinas', details: error.message });
  }
});

// POST /api/machines
router.post('/', async (req, res) => {
  try {
    console.log('Dados recebidos da máquina:', req.body);
    const db = await connect();
    console.log('Conexão com banco estabelecida');
    
    // Adicionar timestamps automáticos
    const machineData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('machines').insertOne(machineData);
    console.log('Máquina inserida com sucesso:', result);
    res.status(201).json(result.ops ? result.ops[0] : machineData);
  } catch (error) {
    console.error('Erro ao criar máquina:', error);
    res.status(500).json({ error: 'Erro ao criar máquina', details: error.message });
  }
});

// PUT /api/machines/:id
router.put('/:id', async (req, res) => {
  try {
    const db = await connect();
    const { id } = req.params;
    await db.collection('machines').updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar máquina', details: error.message });
  }
});

// DELETE /api/machines/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await connect();
    const { id } = req.params;
    await db.collection('machines').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover máquina', details: error.message });
  }
});

module.exports = router; 