import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes';
const client = new MongoClient(uri);

async function checkSpecificOperation() {
  try {
    await client.connect();
    const db = client.db('simoldes');
    
    console.log('=== VERIFICANDO OPERAÇÃO ESPECÍFICA ===\n');
    
    const op = await db.collection('operations').findOne({ _id: new ObjectId('685a112b69b7b99944c6b2a0') });
    if (op) {
      console.log('Documento completo:');
      console.log(JSON.stringify(op, null, 2));
      
      console.log('\nTipos dos campos:');
      Object.keys(op).forEach(key => {
        const value = op[key];
        console.log(`${key}: ${typeof value} ${value instanceof Date ? '(Date)' : ''} ${value instanceof ObjectId ? '(ObjectId)' : ''}`);
      });
    } else {
      console.log('Operação não encontrada');
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
  }
}

checkSpecificOperation(); 