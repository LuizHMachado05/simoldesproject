const express = require('express');
const router = express.Router();
const { connect } = require('../db/mongodb');
const bcrypt = require('bcryptjs');

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

// ROTA TEMPORÁRIA: Promover máquina a admin
router.post('/promote-admin', async (req, res) => {
  try {
    const { machineId } = req.body;
    if (!machineId) {
      return res.status(400).json({ error: 'machineId é obrigatório' });
    }
    const db = await connect();
    const result = await db.collection('machines').updateOne(
      { machineId },
      { $set: { role: 'admin' } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Máquina não encontrada' });
    }
    res.json({ success: true, message: `Máquina ${machineId} promovida a admin.` });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao promover máquina', details: error.message });
  }
});

// Endpoint de login de operador/admin
router.post('/operator-login', async (req, res) => {
  try {
    const { operatorId, password } = req.body;
    if (!operatorId || !password) {
      return res.status(400).json({ error: 'operatorId e password são obrigatórios' });
    }
    
    console.log('Tentativa de login de operador:', { operatorId, password: '***' });
    
    const db = await connect();
    
    // Buscar operador pelo code (que é o operatorId) e verificar se está ativo
    const operator = await db.collection('operators').findOne({ 
      code: operatorId, 
      active: true 
    });
    
    if (!operator) {
      console.log('Operador não encontrado ou inativo:', operatorId);
      return res.status(401).json({ 
        success: false,
        error: 'Operador não encontrado ou inativo' 
      });
    }
    
    // Verificar senha
    // Se usar hash, descomente a linha abaixo e comente a comparação direta
    // const valid = await bcrypt.compare(password, operator.password);
    const valid = operator.password === password;
    
    if (!valid) {
      console.log('Senha incorreta para operador:', operatorId);
      return res.status(401).json({ 
        success: false,
        error: 'Senha incorreta' 
      });
    }
    
    // Remover senha dos dados retornados
    const { password: _, ...operatorData } = operator;
    
    console.log('Login bem-sucedido para operador:', operatorId, 'Role:', operator.role);
    
    res.json({ 
      success: true, 
      operator: operatorData 
    });
  } catch (error) {
    console.error('Erro ao autenticar operador:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao autenticar operador', 
      details: error.message 
    });
  }
});

module.exports = router; 