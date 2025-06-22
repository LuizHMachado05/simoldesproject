const express = require('express');
const router = express.Router();
const { connect } = require('../db/mongodb');
const { ObjectId } = require('mongodb');

// GET /api/operators
router.get('/', async (req, res) => {
  try {
    const db = await connect();
    const operators = await db.collection('operators').find({}).toArray();
    res.json(operators);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar operadores', details: error.message });
  }
});

// POST /api/operators
router.post('/', async (req, res) => {
  try {
    console.log('Dados recebidos:', req.body);
    const db = await connect();
    console.log('Conexão com banco estabelecida');
    
    // Adicionar timestamps automáticos
    const operatorData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('operators').insertOne(operatorData);
    console.log('Operador inserido com sucesso:', result);
    res.status(201).json(result.ops ? result.ops[0] : operatorData);
  } catch (error) {
    console.error('Erro ao criar operador:', error);
    res.status(500).json({ error: 'Erro ao criar operador', details: error.message });
  }
});

// PUT /api/operators/:id
router.put('/:id', async (req, res) => {
  try {
    const db = await connect();
    const { id } = req.params;
    await db.collection('operators').updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar operador', details: error.message });
  }
});

// DELETE /api/operators/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await connect();
    const { id } = req.params;
    await db.collection('operators').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover operador', details: error.message });
  }
});

module.exports = router; 