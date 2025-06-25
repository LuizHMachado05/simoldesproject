import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes';
const client = new MongoClient(uri);

async function debugMongoDB() {
  try {
    await client.connect();
    const db = client.db('simoldes');
    
    console.log('=== CONECTADO AO MONGODB ATLAS ===\n');
    
    // 1. Verificar a operação problemática
    console.log('1. OPERAÇÃO PROBLEMÁTICA:');
    const problemOp = await db.collection('operations').findOne({ _id: new ObjectId('685b3df9c143c048b42a6a5e') });
    if (problemOp) {
      console.log('Documento encontrado:');
      console.log(JSON.stringify(problemOp, null, 2));
      
      // Verificar tipos dos campos
      console.log('\nTipos dos campos:');
      console.log('projectId:', typeof problemOp.projectId, 'isObjectId:', problemOp.projectId instanceof ObjectId);
      console.log('createdAt:', typeof problemOp.createdAt, 'isDate:', problemOp.createdAt instanceof Date);
      console.log('updatedAt:', typeof problemOp.updatedAt, 'isDate:', problemOp.updatedAt instanceof Date);
    } else {
      console.log('Operação não encontrada');
    }
    
    // 2. Verificar schema da coleção
    console.log('\n2. SCHEMA DA COLEÇÃO:');
    const collections = await db.listCollections({ name: 'operations' }).toArray();
    if (collections.length > 0) {
      const collInfo = await db.command({ listCollections: 1, filter: { name: 'operations' } });
      console.log('Schema:', JSON.stringify(collInfo.cursor.firstBatch[0], null, 2));
    }
    
    // 3. Tentar um update manual para ver o erro exato
    console.log('\n3. TESTE DE UPDATE MANUAL:');
    try {
      const testUpdate = {
        completed: true,
        signedBy: 'Teste',
        timestamp: new Date(),
        inspectionNotes: 'Teste',
        measurementValue: '10mm'
      };
      
      const result = await db.collection('operations').updateOne(
        { _id: new ObjectId('685b3df9c143c048b42a6a5e') },
        { $set: testUpdate }
      );
      console.log('Update manual funcionou:', result);
    } catch (updateError) {
      console.log('Erro no update manual:', updateError.message);
      if (updateError.errInfo) {
        console.log('Detalhes da validação:', JSON.stringify(updateError.errInfo, null, 2));
      }
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  } finally {
    await client.close();
  }
}

debugMongoDB(); 