import { MongoClient, ObjectId } from 'mongodb';

const uri = "mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes";
const client = new MongoClient(uri);

async function seedLogs() {
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db('simoldes');
    const logsCollection = db.collection('logs');

    // Limpar logs existentes
    await logsCollection.deleteMany({});
    console.log('Logs existentes removidos');

    // Logs de exemplo
    const sampleLogs = [
      {
        type: 'Login',
        user: 'João Silva',
        machine: 'F1400',
        details: 'Login bem-sucedido no sistema',
        severity: 'low',
        timestamp: new Date('2024-01-15T08:30:15'),
        createdAt: new Date('2024-01-15T08:30:15'),
        updatedAt: new Date('2024-01-15T08:30:15')
      },
      {
        type: 'Operação',
        user: 'Maria Santos',
        machine: 'F1400',
        details: 'Iniciou operação: MOLDE CARCAÇA FRONTAL - Sequência 07',
        severity: 'low',
        timestamp: new Date('2024-01-15T09:45:22'),
        createdAt: new Date('2024-01-15T09:45:22'),
        updatedAt: new Date('2024-01-15T09:45:22')
      },
      {
        type: 'Operação',
        user: 'Maria Santos',
        machine: 'F1400',
        details: 'Concluiu operação: MOLDE CARCAÇA FRONTAL - Sequência 07',
        severity: 'low',
        timestamp: new Date('2024-01-15T10:15:30'),
        createdAt: new Date('2024-01-15T10:15:30'),
        updatedAt: new Date('2024-01-15T10:15:30')
      },
      {
        type: 'Erro',
        user: 'Sistema',
        machine: 'T2500',
        details: 'Falha na conexão com o banco de dados - Timeout',
        severity: 'high',
        timestamp: new Date('2024-01-15T10:12:05'),
        createdAt: new Date('2024-01-15T10:12:05'),
        updatedAt: new Date('2024-01-15T10:12:05')
      },
      {
        type: 'Manutenção',
        user: 'Carlos Pereira',
        machine: 'T2500',
        details: 'Início de manutenção preventiva - Troca de óleo e filtros',
        severity: 'medium',
        timestamp: new Date('2024-01-15T11:30:00'),
        createdAt: new Date('2024-01-15T11:30:00'),
        updatedAt: new Date('2024-01-15T11:30:00')
      },
      {
        type: 'Login',
        user: 'Ana Costa',
        machine: 'F1400',
        details: 'Login bem-sucedido no sistema',
        severity: 'low',
        timestamp: new Date('2024-01-15T13:20:10'),
        createdAt: new Date('2024-01-15T13:20:10'),
        updatedAt: new Date('2024-01-15T13:20:10')
      },
      {
        type: 'Operação',
        user: 'Ana Costa',
        machine: 'F1400',
        details: 'Iniciou operação: MOLDE LATERAL DIREITO - Sequência 04',
        severity: 'low',
        timestamp: new Date('2024-01-15T13:25:45'),
        createdAt: new Date('2024-01-15T13:25:45'),
        updatedAt: new Date('2024-01-15T13:25:45')
      },
      {
        type: 'Sistema',
        user: 'Sistema',
        machine: 'Sistema',
        details: 'Backup automático realizado com sucesso',
        severity: 'low',
        timestamp: new Date('2024-01-15T14:00:00'),
        createdAt: new Date('2024-01-15T14:00:00'),
        updatedAt: new Date('2024-01-15T14:00:00')
      },
      {
        type: 'Segurança',
        user: 'Sistema',
        machine: 'F1400',
        details: 'Tentativa de login falhou - Senha incorreta',
        severity: 'medium',
        timestamp: new Date('2024-01-15T14:30:22'),
        createdAt: new Date('2024-01-15T14:30:22'),
        updatedAt: new Date('2024-01-15T14:30:22')
      },
      {
        type: 'Manutenção',
        user: 'Carlos Pereira',
        machine: 'T2500',
        details: 'Manutenção concluída - Máquina liberada para operação',
        severity: 'medium',
        timestamp: new Date('2024-01-15T15:45:30'),
        createdAt: new Date('2024-01-15T15:45:30'),
        updatedAt: new Date('2024-01-15T15:45:30')
      },
      {
        type: 'Login',
        user: 'Pedro Oliveira',
        machine: 'T2500',
        details: 'Login bem-sucedido no sistema',
        severity: 'low',
        timestamp: new Date('2024-01-15T16:00:15'),
        createdAt: new Date('2024-01-15T16:00:15'),
        updatedAt: new Date('2024-01-15T16:00:15')
      },
      {
        type: 'Operação',
        user: 'Pedro Oliveira',
        machine: 'T2500',
        details: 'Iniciou operação: MOLDE SUPERIOR - Sequência 12',
        severity: 'low',
        timestamp: new Date('2024-01-15T16:05:30'),
        createdAt: new Date('2024-01-15T16:05:30'),
        updatedAt: new Date('2024-01-15T16:05:30')
      },
      {
        type: 'Erro',
        user: 'Sistema',
        machine: 'F1400',
        details: 'Erro de comunicação com sensor de temperatura',
        severity: 'medium',
        timestamp: new Date('2024-01-15T16:30:45'),
        createdAt: new Date('2024-01-15T16:30:45'),
        updatedAt: new Date('2024-01-15T16:30:45')
      },
      {
        type: 'Sistema',
        user: 'Sistema',
        machine: 'Sistema',
        details: 'Atualização de firmware concluída',
        severity: 'low',
        timestamp: new Date('2024-01-15T17:00:00'),
        createdAt: new Date('2024-01-15T17:00:00'),
        updatedAt: new Date('2024-01-15T17:00:00')
      },
      {
        type: 'Login',
        user: 'João Silva',
        machine: 'F1400',
        details: 'Logout do sistema',
        severity: 'low',
        timestamp: new Date('2024-01-15T17:30:20'),
        createdAt: new Date('2024-01-15T17:30:20'),
        updatedAt: new Date('2024-01-15T17:30:20')
      }
    ];

    // Inserir logs
    const result = await logsCollection.insertMany(sampleLogs);
    console.log(`${result.insertedCount} logs inseridos com sucesso`);

    // Criar índices para melhor performance
    await logsCollection.createIndex({ timestamp: -1 });
    await logsCollection.createIndex({ type: 1 });
    await logsCollection.createIndex({ user: 1 });
    await logsCollection.createIndex({ machine: 1 });
    await logsCollection.createIndex({ severity: 1 });
    
    console.log('Índices criados com sucesso');

  } catch (error) {
    console.error('Erro ao popular logs:', error);
  } finally {
    await client.close();
    console.log('Conexão fechada');
  }
}

// Executar se chamado diretamente
seedLogs(); 