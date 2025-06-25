import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: './api/.env' });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/simoldes';
const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    const db = client.db('simoldes');
    const op = await db.collection('operations').findOne({ _id: new ObjectId('685b3df9c143c048b42a6a5e') });
    console.log('Documento da operação:', JSON.stringify(op, null, 2));
  } catch (e) {
    console.error('Erro ao buscar operação:', e);
  } finally {
    await client.close();
  }
}

main(); 