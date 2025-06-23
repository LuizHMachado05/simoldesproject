const express = require('express');
const router = express.Router();
const { connect } = require('../db/mongodb');

// POST /api/auth/login - Autenticação de máquina
router.post('/login', async (req, res) => {
  try {
    const { machineId, password } = req.body;
    
    // Validar dados obrigatórios
    if (!machineId || !password) {
      return res.status(400).json({ 
        error: 'Dados obrigatórios faltando', 
        required: ['machineId', 'password'] 
      });
    }

    console.log('Tentativa de login:', { machineId, password: '***' });
    
    const db = await connect();
    
    // Buscar máquina pelo machineId e senha
    const machine = await db.collection('machines').findOne({
      machineId: machineId,
      password: password,
      status: 'active' // Só permite login de máquinas ativas
    });

    if (machine) {
      // Login bem-sucedido - atualizar último login
      await db.collection('machines').updateOne(
        { _id: machine._id },
        { 
          $set: { 
            lastLogin: new Date(),
            updatedAt: new Date()
          }
        }
      );

      // Retornar dados da máquina (sem a senha)
      const { password: _, ...machineData } = machine;
      
      console.log('Login bem-sucedido para máquina:', machineId);
      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        machine: machineData
      });
    } else {
      console.log('Login falhou para máquina:', machineId);
      res.status(401).json({
        success: false,
        error: 'Código de máquina ou senha inválidos'
      });
    }
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// GET /api/auth/verify - Verificar se a máquina está autenticada
router.get('/verify', async (req, res) => {
  try {
    const { machineId } = req.query;
    
    if (!machineId) {
      return res.status(400).json({ 
        error: 'machineId é obrigatório' 
      });
    }

    const db = await connect();
    const machine = await db.collection('machines').findOne({
      machineId: machineId,
      status: 'active'
    });

    if (machine) {
      const { password: _, ...machineData } = machine;
      res.json({
        success: true,
        machine: machineData
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Máquina não encontrada'
      });
    }
  } catch (error) {
    console.error('Erro ao verificar máquina:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

module.exports = router; 