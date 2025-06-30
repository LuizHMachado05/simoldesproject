const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes';
const client = new MongoClient(uri);

let db;

async function connect() {
  if (!db) {
    await client.connect();
    const dbName = 'simoldes';
    db = client.db(dbName);
  }
  return db;
}

module.exports = { connect }; 