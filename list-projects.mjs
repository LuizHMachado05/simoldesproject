import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes';
const client = new MongoClient(uri);

async function listProjects() {
  try {
    await client.connect();
    const db = client.db('simoldes');
    const projects = await db.collection('projects').find({}).toArray();
    console.log('=== PROJETOS ATUAIS ===');
    projects.forEach((proj, idx) => {
      console.log(`${idx + 1}. _id: ${proj._id} | projectId: ${proj.projectId} | name: ${proj.name}`);
    });
  } catch (e) {
    console.error('Erro ao listar projetos:', e);
  } finally {
    await client.close();
  }
}

listProjects(); 