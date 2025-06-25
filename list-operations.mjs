import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes';
const client = new MongoClient(uri);

async function listOperations() {
  try {
    await client.connect();
    const db = client.db('simoldes');
    // Buscar o _id do projeto 1671_32
    const project = await db.collection('projects').findOne({ projectId: '1671_32' });
    if (!project) {
      console.log('Projeto 1671_32 não encontrado');
      return;
    }
    const ops = await db.collection('operations').find({ projectId: project._id }).toArray();
    console.log(`=== OPERAÇÕES DO PROJETO 1671_32 (${project._id}) ===`);
    ops.forEach((op, idx) => {
      console.log(`${idx + 1}. _id: ${op._id} | sequence: ${op.sequence} | completed: ${op.completed}`);
    });
  } catch (e) {
    console.error('Erro ao listar operações:', e);
  } finally {
    await client.close();
  }
}

listOperations(); 