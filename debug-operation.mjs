import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes';
const client = new MongoClient(uri);

async function debugOperation() {
  try {
    console.log('Conectando ao MongoDB Atlas...');
    await client.connect();
    console.log('✅ Conectado!');
    
    const db = client.db('simoldes');
    
    // Buscar o projeto
    const project = await db.collection('projects').findOne({ projectId: '1668_18' });
    console.log('Projeto encontrado:', project._id);
    
    // Buscar operações do projeto
    const operations = await db.collection('operations').find({ projectId: project._id }).toArray();
    console.log(`Operações encontradas: ${operations.length}`);
    
    operations.forEach(op => {
      console.log('Operação:', {
        _id: op._id,
        id: op.id,
        sequence: op.sequence,
        projectId: op.projectId,
        completed: op.completed
      });
    });
    
    // Testar filtro específico
    const operationFilter = { 
      projectId: project._id,
      id: 1 
    };
    
    console.log('\nTestando filtro:', operationFilter);
    const foundOperation = await db.collection('operations').findOne(operationFilter);
    
    if (foundOperation) {
      console.log('✅ Operação encontrada com filtro!');
      console.log('Operação:', {
        _id: foundOperation._id,
        id: foundOperation.id,
        sequence: foundOperation.sequence,
        completed: foundOperation.completed
      });
    } else {
      console.log('❌ Operação NÃO encontrada com filtro');
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
  }
}

debugOperation(); 