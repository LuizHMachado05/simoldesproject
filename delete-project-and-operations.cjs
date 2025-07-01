// Script para excluir um projeto e todas as operações associadas
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb://localhost:27017'; // Ajuste se necessário
const dbName = 'simoldes'; // Ajuste se necessário

async function deleteProjectAndOperations(projectIdOrObjectId) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    // Buscar o projeto
    let project;
    if (ObjectId.isValid(projectIdOrObjectId)) {
      project = await db.collection('projects').findOne({ _id: new ObjectId(projectIdOrObjectId) });
    }
    if (!project) {
      project = await db.collection('projects').findOne({ projectId: projectIdOrObjectId });
    }
    if (!project) {
      console.log('Projeto não encontrado:', projectIdOrObjectId);
      return;
    }
    console.log('Projeto encontrado:', project._id, project.projectId);

    // Excluir operações associadas
    const opResult = await db.collection('operations').deleteMany({ projectId: project._id });
    console.log(`Operações excluídas: ${opResult.deletedCount}`);

    // Excluir o projeto
    const projResult = await db.collection('projects').deleteOne({ _id: project._id });
    console.log(`Projeto excluído: ${projResult.deletedCount}`);
  } catch (err) {
    console.error('Erro ao excluir:', err);
  } finally {
    await client.close();
  }
}

// Uso: node delete-project-and-operations.js <projectId ou _id>
const arg = process.argv[2];
if (!arg) {
  console.log('Uso: node delete-project-and-operations.js <projectId ou _id>');
  process.exit(1);
}
deleteProjectAndOperations(arg); 