import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');
    return client.db('simoldes');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    throw error;
  }
}

export async function closeConnection() {
  try {
    await client.close();
    console.log('Conexão com MongoDB fechada');
  } catch (error) {
    console.error('Erro ao fechar conexão:', error);
    throw error;
  }
} 