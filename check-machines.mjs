import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes';
const client = new MongoClient(uri);

async function checkMachines() {
  try {
    console.log('Conectando ao MongoDB Atlas...');
    await client.connect();
    console.log('✅ Conectado!');
    
    const db = client.db('simoldes');
    
    // Verificar máquinas existentes
    const machines = await db.collection('machines').find({}).toArray();
    console.log('\n=== MÁQUINAS EXISTENTES ===');
    console.log(`Total de máquinas: ${machines.length}`);
    
    machines.forEach(machine => {
      console.log(`- ID: ${machine.machineId}, Nome: ${machine.name}`);
    });
    
    // Verificar projetos existentes
    const projects = await db.collection('projects').find({}).toArray();
    console.log('\n=== PROJETOS EXISTENTES ===');
    console.log(`Total de projetos: ${projects.length}`);
    
    projects.forEach(project => {
      console.log(`- ID: ${project.projectId}, Nome: ${project.name}, Máquina: ${project.machine}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
  }
}

checkMachines(); 