import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes";
const client = new MongoClient(uri);

async function checkOperators() {
  try {
    await client.connect();
    console.log('🔍 Verificando operadores no banco de dados...');

    const db = client.db('simoldes');
    const operators = await db.collection('operators').find({}).toArray();

    console.log(`📊 Total de operadores encontrados: ${operators.length}\n`);

    console.log('📋 Lista de operadores:');
    operators.forEach((op, index) => {
      console.log(`${index + 1}. ${op.code} - ${op.name} (${op.role})`);
      console.log(`   Matrícula: ${op.matricula || 'N/A'}`);
      console.log(`   Senha: ${op.password}`);
      console.log(`   Ativo: ${op.active ? 'Sim' : 'Não'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erro ao verificar operadores:', error);
  } finally {
    await client.close();
  }
}

checkOperators(); 