import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes';
const client = new MongoClient(uri);

async function fixOperationIds() {
  try {
    await client.connect();
    const db = client.db('simoldes');
    const operations = await db.collection('operations').find({}).toArray();
    // Agrupar operações por projectId
    const grouped = {};
    for (const op of operations) {
      const pid = String(op.projectId);
      if (!grouped[pid]) grouped[pid] = [];
      grouped[pid].push(op);
    }
    let updatedCount = 0;
    for (const [projectId, ops] of Object.entries(grouped)) {
      // Ordenar por sequence
      ops.sort((a, b) => (a.sequence > b.sequence ? 1 : -1));
      for (let i = 0; i < ops.length; i++) {
        const op = ops[i];
        if (typeof op.id === 'number') continue;
        const newId = i + 1;
        await db.collection('operations').updateOne(
          { _id: op._id },
          { $set: { id: newId } }
        );
        updatedCount++;
        console.log(`Operação ${op._id} do projeto ${projectId} atualizada com id: ${newId}`);
      }
    }
    console.log(`Atualização concluída. Operações atualizadas: ${updatedCount}`);
  } catch (e) {
    console.error('Erro ao corrigir ids:', e);
  } finally {
    await client.close();
  }
}

fixOperationIds(); 