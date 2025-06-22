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

module.exports = router; 