import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes';
const client = new MongoClient(uri);

async function checkBackendData() {
  try {
    await client.connect();
    const db = client.db('simoldes');
    
    console.log('=== VERIFICANDO DADOS DO BACKEND ===\n');
    
    // Listar todas as operações
    const operations = await db.collection('operations').find({}).toArray();
    console.log(`Total de operações no banco: ${operations.length}`);
    
    operations.forEach((op, index) => {
      console.log(`${index + 1}. _id: ${op._id}, projectId: ${op.projectId}, sequence: ${op.sequence}`);
    });
    
    // Verificar se há a operação que estávamos testando
    const targetOp = await db.collection('operations').findOne({ _id: new ObjectId('685b3df9c143c048b42a6a5e') });
    if (targetOp) {
      console.log('\n✅ Operação 685b3df9c143c048b42a6a5e encontrada no banco');
    } else {
      console.log('\n❌ Operação 685b3df9c143c048b42a6a5e NÃO encontrada no banco');
    }
    
    // Verificar a operação que o backend está retornando
    const backendOp = await db.collection('operations').findOne({ _id: new ObjectId('685a112b69b7b99944c6b2a0') });
    if (backendOp) {
      console.log('\n✅ Operação 685a112b69b7b99944c6b2a0 (backend) encontrada no banco');
      console.log('Tipos dos campos:');
      console.log('projectId:', typeof backendOp.projectId, 'isObjectId:', backendOp.projectId instanceof ObjectId);
      console.log('createdAt:', typeof backendOp.createdAt, 'isDate:', backendOp.createdAt instanceof Date);
      console.log('updatedAt:', typeof backendOp.updatedAt, 'isDate:', backendOp.updatedAt instanceof Date);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
  }
}

checkBackendData(); 