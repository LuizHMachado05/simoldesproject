import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: './api/.env' });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/simoldes';
const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    const db = client.db('simoldes');
    const ops = await db.collection('operations').find({}).toArray();
    let updated = 0;
    for (const op of ops) {
      let needsUpdate = false;
      const update = {};
      // Corrigir projectId
      if (op.projectId && typeof op.projectId === 'string' && ObjectId.isValid(op.projectId)) {
        update.projectId = new ObjectId(op.projectId);
        needsUpdate = true;
      }
      // Corrigir createdAt
      if (op.createdAt && typeof op.createdAt === 'string') {
        update.createdAt = new Date(op.createdAt);
        needsUpdate = true;
      }
      // Corrigir updatedAt
      if (op.updatedAt && typeof op.updatedAt === 'string') {
        update.updatedAt = new Date(op.updatedAt);
        needsUpdate = true;
      }
      if (needsUpdate) {
        await db.collection('operations').updateOne({ _id: op._id }, { $set: update });
        updated++;
        console.log(`Corrigido: ${op._id}`);
      }
    }
    console.log(`Total de operações corrigidas: ${updated}`);
  } catch (e) {
    console.error('Erro ao corrigir operações:', e);
  } finally {
    await client.close();
  }
}

main(); 