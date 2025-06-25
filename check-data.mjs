import { MongoClient } from 'mongodb';

async function checkData() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('simoldes');
    
    console.log('=== VERIFICANDO DADOS ===\n');
    
    // Verificar projetos
    console.log('1. PROJETOS:');
    const projects = await db.collection('projects').find({}).toArray();
    projects.forEach(project => {
      console.log(`  - ${project.name} (${project.projectId}) - _id: ${project._id}`);
    });
    
    console.log('\n2. OPERAÇÕES:');
    const operations = await db.collection('operations').find({}).toArray();
    operations.forEach(op => {
      console.log(`  - Seq: ${op.sequence}, ID: ${op.id}, ProjectId: ${op.projectId}, Type: ${op.type}`);
    });
    
    // Verificar operações de um projeto específico
    console.log('\n3. OPERAÇÕES DO PROJETO 1671_32:');
    const project1671 = await db.collection('projects').findOne({ projectId: '1671_32' });
    if (project1671) {
      console.log(`Projeto encontrado: ${project1671._id}`);
      const projectOps = await db.collection('operations').find({ projectId: project1671._id }).toArray();
      projectOps.forEach(op => {
        console.log(`  - Seq: ${op.sequence}, ID: ${op.id}, Completed: ${op.completed}`);
      });
    } else {
      console.log('Projeto 1671_32 não encontrado');
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
  }
}

checkData(); 