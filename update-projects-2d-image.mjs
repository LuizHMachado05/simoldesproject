import { MongoClient } from 'mongodb';

// Substitua pela sua string de conexão do MongoDB Atlas
const uri = 'mongodb+srv://simoldes:Simoldes2024@simoldescluster.6kq8v8v.mongodb.net/?retryWrites=true&w=majority&appName=SimoldesCluster';
const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    const db = client.db(); // Usa o banco padrão do cluster
    const result = await db.collection('projects').updateMany(
      {},
      { $set: { image2dUrl: '/2d.png' } }
    );
    console.log(`Projetos atualizados: ${result.modifiedCount}`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main(); 