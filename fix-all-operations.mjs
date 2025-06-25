import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes';
const client = new MongoClient(uri);

async function fixAllOperations() {
  try {
    await client.connect();
    const db = client.db('simoldes');
    
    console.log('=== CORRIGINDO TODAS AS OPERAÇÕES ===\n');
    
    const operations = await db.collection('operations').find({}).toArray();
    console.log(`Total de operações encontradas: ${operations.length}`);
    
    let fixedCount = 0;
    
    for (const op of operations) {
      let needsFix = false;
      const fixData = {};
      
      // Corrigir projectId se for string
      if (op.projectId && typeof op.projectId === 'string' && ObjectId.isValid(op.projectId)) {
        fixData.projectId = new ObjectId(op.projectId);
        needsFix = true;
        console.log(`  - projectId corrigido: ${op.projectId} → ObjectId`);
      }
      
      // Corrigir createdAt se for string
      if (op.createdAt && typeof op.createdAt === 'string') {
        fixData.createdAt = new Date(op.createdAt);
        needsFix = true;
        console.log(`  - createdAt corrigido: ${op.createdAt} → Date`);
      }
      
      // Corrigir updatedAt se for string
      if (op.updatedAt && typeof op.updatedAt === 'string') {
        fixData.updatedAt = new Date(op.updatedAt);
        needsFix = true;
        console.log(`  - updatedAt corrigido: ${op.updatedAt} → Date`);
      }
      
      if (needsFix) {
        await db.collection('operations').updateOne(
          { _id: op._id },
          { $set: fixData }
        );
        fixedCount++;
        console.log(`  ✅ Operação ${op._id} corrigida`);
      }
    }
    
    console.log(`\n=== RESULTADO ===`);
    console.log(`Operações corrigidas: ${fixedCount}`);
    console.log(`Operações que já estavam corretas: ${operations.length - fixedCount}`);
    
    // Testar se a correção funcionou
    console.log(`\n=== TESTE PÓS-CORREÇÃO ===`);
    const testOp = await db.collection('operations').findOne({ _id: new ObjectId('685b3df9c143c048b42a6a5e') });
    if (testOp) {
      console.log('Tipos após correção:');
      console.log('projectId:', typeof testOp.projectId, 'isObjectId:', testOp.projectId instanceof ObjectId);
      console.log('createdAt:', typeof testOp.createdAt, 'isDate:', testOp.createdAt instanceof Date);
      console.log('updatedAt:', typeof testOp.updatedAt, 'isDate:', testOp.updatedAt instanceof Date);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
  }
}

fixAllOperations(); 