const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI;

interface CollectionInfo {
  name: string;
}

async function testConnection() {
  const client = new MongoClient(uri);
  
  try {
    console.log('Tentando conectar ao MongoDB...');
    await client.connect();
    console.log('✅ Conexão com MongoDB estabelecida com sucesso!');

    const db = client.db('simoldes');
    
    // Testar conexão com as collections
    console.log('\nVerificando collections...');
    
    // Listar todas as collections
    const collections = await db.listCollections().toArray();
    console.log('Collections encontradas:', collections.map((c: CollectionInfo) => c.name).join(', '));

    // Testar cada collection principal
    const mainCollections = ['operators', 'machines', 'programs', 'operations', 'logs'];
    
    for (const collectionName of mainCollections) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        console.log(`✅ Collection '${collectionName}': ${count} documentos encontrados`);
      } catch (error) {
        console.log(`❌ Collection '${collectionName}': Não encontrada ou erro ao acessar`);
      }
    }

    // Testar uma operação de leitura
    console.log('\nTestando operação de leitura...');
    const operators = await db.collection('operators').find({}).limit(1).toArray();
    console.log('Operadores encontrados:', operators.length > 0 ? 'Sim' : 'Não');

  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
  } finally {
    await client.close();
    console.log('\nConexão fechada.');
  }
}

// Executar o teste
testConnection().catch(console.error); 