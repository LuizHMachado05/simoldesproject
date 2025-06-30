import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes";
const client = new MongoClient(uri);

async function seedOperators() {
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db('simoldes');

    // Limpar coleção de operadores
    await db.collection('operators').deleteMany({});
    console.log('Coleção de operadores limpa');

    // Dados dos operadores
    const operators = [
      {
        matricula: '001',
        name: 'Administrador Sistema',
        code: 'admin',
        password: 'admin123',
        role: 'admin',
        cargo: 'Administrador',
        turno: 'Integral',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        matricula: '002',
        name: 'Luiz Henrique',
        code: 'luiz',
        password: 'luiz123',
        role: 'admin',
        cargo: 'Supervisor',
        turno: 'Manhã',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        matricula: '003',
        name: 'Maria Silva',
        code: 'op1',
        password: 'op1pass',
        role: 'operator',
        cargo: 'Operadora CNC',
        turno: 'Tarde',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        matricula: '004',
        name: 'João Santos',
        code: 'op2',
        password: 'op2pass',
        role: 'operator',
        cargo: 'Operador CNC',
        turno: 'Noite',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        matricula: '005',
        name: 'Ana Oliveira',
        code: 'sup1',
        password: 'sup1pass',
        role: 'supervisor',
        cargo: 'Supervisora',
        turno: 'Manhã',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Inserir operadores
    const result = await db.collection('operators').insertMany(operators);
    console.log(`${result.insertedCount} operadores inseridos com sucesso!`);

    // Listar operadores criados
    const createdOperators = await db.collection('operators').find({}).toArray();
    console.log('\nOperadores criados:');
    createdOperators.forEach(op => {
      console.log(`- ${op.name} (${op.code}) - Role: ${op.role}`);
    });

    console.log('\nPara fazer login como admin, use:');
    console.log('Código: admin');
    console.log('Senha: admin123');
    console.log('\nOu:');
    console.log('Código: luiz');
    console.log('Senha: luiz123');

  } catch (error) {
    console.error('Erro ao popular operadores:', error);
  } finally {
    await client.close();
    console.log('Conexão fechada');
  }
}

// Executar o script
seedOperators(); 