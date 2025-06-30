require('dotenv').config({ path: require('path').resolve(__dirname, '../../api/.env') });
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/simoldes';
const client = new MongoClient(uri);

async function fixOperationIds() {
  const db = client.db('simoldes');
  const operations = await db.collection('operations').find({}).toArray();

  let updatedCount = 0;
  let skippedCount = 0;

  // Agrupar operações por projectId
  const grouped = {};
  for (const op of operations) {
    const pid = String(op.projectId);
    if (!grouped[pid]) grouped[pid] = [];
    grouped[pid].push(op);
  }

  for (const [projectId, ops] of Object.entries(grouped)) {
    // Ordenar por sequence para garantir ordem
    ops.sort((a, b) => (a.sequence > b.sequence ? 1 : -1));
    for (let i = 0; i < ops.length; i++) {
      const op = ops[i];
      if (typeof op.id === 'number') {
        skippedCount++;
        continue;
      }
      const newId = i + 1;
      await db.collection('operations').updateOne(
        { _id: op._id },
        { $set: { id: newId } }
      );
      updatedCount++;
      console.log(`Operação ${op._id} do projeto ${projectId} atualizada com id: ${newId}`);
    }
  }

  console.log(`Atualização concluída. Operações atualizadas: ${updatedCount}, já tinham id: ${skippedCount}`);
  process.exit(0);
}

client.connect().then(fixOperationIds).catch(err => {
  console.error('Erro ao conectar no MongoDB:', err);
  process.exit(1);
}); 