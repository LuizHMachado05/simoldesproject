const { connect } = require('../../api/db/mongodb');

async function fixOperationIds() {
  const db = await connect();
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

fixOperationIds(); 