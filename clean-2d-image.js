import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://simoldes:Simoldes2024@simoldescluster.6kq8v8v.mongodb.net/?retryWrites=true&w=majority&appName=SimoldesCluster';
const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    const db = client.db();

    // Limpa imageUrl dos projetos
    const projResult = await db.collection('projects').updateMany(
      { imageUrl: '/2d.png' },
      { $set: { imageUrl: '' } }
    );
    // Limpa imageUrl das operações
    const opResult = await db.collection('operations').updateMany(
      { imageUrl: '/2d.png' },
      { $set: { imageUrl: '' } }
    );
    console.log(`Projetos limpos: ${projResult.modifiedCount}`);
    console.log(`Operações limpas: ${opResult.modifiedCount}`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main(); 