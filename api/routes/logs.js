const express = require('express');
const router = express.Router();
const { connect } = require('../db/mongodb');
const { ObjectId } = require('mongodb');

// GET /api/logs - Buscar todos os logs com filtros opcionais
router.get('/', async (req, res) => {
  try {
    const db = await connect();
    const { type, user, machine, startDate, endDate, limit = 100 } = req.query;
    
    // Construir filtro baseado nos parâmetros
    let filter = {};
    
    if (type) {
      filter.type = { $regex: type, $options: 'i' };
    }
    
    if (user) {
      filter.user = { $regex: user, $options: 'i' };
    }
    
    if (machine) {
      filter.machine = { $regex: machine, $options: 'i' };
    }
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }
    
    const logs = await db.collection('logs')
      .find(filter)
      .sort({ timestamp: -1 }) // Mais recentes primeiro
      .limit(parseInt(limit))
      .toArray();
      
    res.json(logs);
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ error: 'Erro ao buscar logs', details: error.message });
  }
});

// POST /api/logs - Criar novo log
router.post('/', async (req, res) => {
  try {
    console.log('Dados do log recebidos:', req.body);
    const db = await connect();
    
    // Validar dados obrigatórios
    const { type, user, machine, details } = req.body;
    if (!type || !user || !machine || !details) {
      return res.status(400).json({ 
        error: 'Dados obrigatórios faltando', 
        required: ['type', 'user', 'machine', 'details'] 
      });
    }
    
    // Criar objeto do log com timestamp automático
    const logData = {
      ...req.body,
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('logs').insertOne(logData);
    console.log('Log criado com sucesso:', result);
    
    const createdLog = { ...logData, _id: result.insertedId };
    res.status(201).json(createdLog);
  } catch (error) {
    console.error('Erro ao criar log:', error);
    res.status(500).json({ error: 'Erro ao criar log', details: error.message });
  }
});

// PUT /api/logs/:id - Atualizar log
router.put('/:id', async (req, res) => {
  try {
    const db = await connect();
    const { id } = req.params;
    
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    await db.collection('logs').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ success: true, message: 'Log atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar log:', error);
    res.status(500).json({ error: 'Erro ao atualizar log', details: error.message });
  }
});

// DELETE /api/logs/:id - Deletar log
router.delete('/:id', async (req, res) => {
  try {
    const db = await connect();
    const { id } = req.params;
    
    await db.collection('logs').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true, message: 'Log deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar log:', error);
    res.status(500).json({ error: 'Erro ao deletar log', details: error.message });
  }
});

// DELETE /api/logs - Deletar logs antigos (manutenção)
router.delete('/', async (req, res) => {
  try {
    const db = await connect();
    const { days = 30 } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const result = await db.collection('logs').deleteMany({
      timestamp: { $lt: cutoffDate }
    });
    
    res.json({ 
      success: true, 
      message: `${result.deletedCount} logs antigos removidos`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Erro ao limpar logs antigos:', error);
    res.status(500).json({ error: 'Erro ao limpar logs antigos', details: error.message });
  }
});

module.exports = router; 