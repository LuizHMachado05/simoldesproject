import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'simoldes';

async function seedLogs() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');
    
    const db = client.db(DB_NAME);
    const logsCollection = db.collection('logs');
    
    // Limpar logs existentes
    await logsCollection.deleteMany({});
    console.log('Logs existentes removidos');
    
    // Logs de exemplo
    const sampleLogs = [
      {
        type: 'Login',
        user: 'F1400',
        machine: 'F1400',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
        details: 'Login bem-sucedido',
        severity: 'low'
      },
      {
        type: 'Login',
        user: 'João Silva',
        machine: 'F1400',
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutos atrás
        details: 'Login bem-sucedido',
        severity: 'low'
      },
      {
        type: 'Operação',
        user: 'João Silva',
        machine: 'F1400',
        timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutos atrás
        details: 'Operação 001 assinada no projeto 1670_20',
        severity: 'low'
      },
      {
        type: 'Operação',
        user: 'João Silva',
        machine: 'F1400',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutos atrás
        details: 'Operação 002 assinada no projeto 1670_20',
        severity: 'low'
      },
      {
        type: 'Operação',
        user: 'Maria Santos',
        machine: 'F1400',
        timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutos atrás
        details: 'Projeto 1670_20 finalizado',
        severity: 'low'
      },
      {
        type: 'Login',
        user: 'Admin',
        machine: 'Sistema',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
        details: 'Acesso ao painel administrativo',
        severity: 'low'
      },
      {
        type: 'Operação',
        user: 'Admin',
        machine: 'Sistema',
        timestamp: new Date(Date.now() - 1000 * 60 * 55), // 55 minutos atrás
        details: 'Operador João Silva (OP12345) criado com role operator',
        severity: 'low'
      },
      {
        type: 'Operação',
        user: 'Admin',
        machine: 'Sistema',
        timestamp: new Date(Date.now() - 1000 * 60 * 50), // 50 minutos atrás
        details: 'Máquina Fresadora CNC 1400 (F1400) criada',
        severity: 'low'
      },
      {
        type: 'Operação',
        user: 'Admin',
        machine: 'Sistema',
        timestamp: new Date(Date.now() - 1000 * 60 * 40), // 40 minutos atrás
        details: 'Projeto MOLDE LATERAL ESQUERDO (1670_20) criado para máquina F1400',
        severity: 'low'
      },
      {
        type: 'Erro',
        user: 'F1400',
        machine: 'F1400',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutos atrás
        details: 'Tentativa de login falhou - senha incorreta',
        severity: 'medium'
      },
      {
        type: 'Login',
        user: 'F1400',
        machine: 'F1400',
        timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutos atrás
        details: 'Login bem-sucedido',
        severity: 'low'
      },
      {
        type: 'Operação',
        user: 'Admin',
        machine: 'Sistema',
        timestamp: new Date(Date.now() - 1000 * 60 * 1), // 1 minuto atrás
        details: 'Dados da aba users atualizados com sucesso',
        severity: 'low'
      }
    ];
    
    // Inserir logs
    const result = await logsCollection.insertMany(sampleLogs);
    console.log(`${result.insertedCount} logs de exemplo inseridos`);
    
    // Verificar logs inseridos
    const count = await logsCollection.countDocuments();
    console.log(`Total de logs no banco: ${count}`);
    
    // Mostrar alguns logs como exemplo
    const recentLogs = await logsCollection.find().sort({ timestamp: -1 }).limit(5).toArray();
    console.log('\nLogs mais recentes:');
    recentLogs.forEach(log => {
      console.log(`- ${log.timestamp.toLocaleString('pt-BR')} | ${log.type} | ${log.user} | ${log.details}`);
    });
    
  } catch (error) {
    console.error('Erro ao popular logs:', error);
  } finally {
    await client.close();
    console.log('Conexão fechada');
  }
}

seedLogs(); 