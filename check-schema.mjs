import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes';
const client = new MongoClient(uri);

async function checkSchema() {
  try {
    console.log('Conectando ao MongoDB Atlas...');
    await client.connect();
    console.log('✅ Conectado!');
    
    const db = client.db('simoldes');
    
    // Verificar se há validação na coleção operations
    const collections = await db.listCollections().toArray();
    console.log('Coleções:', collections.map(c => c.name));
    
    // Verificar schema da coleção operations
    const options = await db.command({ listCollections: 1, filter: { name: "operations" } });
    console.log('\nSchema da coleção operations:');
    console.log(JSON.stringify(options, null, 2));
    
    // Verificar uma operação existente para ver a estrutura
    const operation = await db.collection('operations').findOne({});
    console.log('\nEstrutura de uma operação existente:');
    console.log(JSON.stringify(operation, null, 2));
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
  }
}

checkSchema(); 