import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

async function checkDatabaseData() {
  const client = new MongoClient(uri);
  
  try {
    console.log('Conectando ao MongoDB...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    const db = client.db('simoldes');
    
    // Verificar todas as collections
    const collections = await db.listCollections().toArray();
    console.log('\nCollections encontradas:', collections.map(c => c.name).join(', '));

    // Verificar dados em cada collection
    for (const collection of collections) {
      console.log(`\n📊 Dados da collection: ${collection.name}`);
      const data = await db.collection(collection.name).find({}).toArray();
      console.log(`Total de documentos: ${data.length}`);
      
      if (data.length > 0) {
        console.log('Exemplo de documento:');
        console.log(JSON.stringify(data[0], null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
    console.log('\nConexão fechada.');
  }
}

// Executar a verificação
checkDatabaseData().catch(console.error); 