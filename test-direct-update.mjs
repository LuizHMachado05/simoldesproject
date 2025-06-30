import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes';
const client = new MongoClient(uri);

async function testDirectUpdate() {
  try {
    await client.connect();
    const db = client.db('simoldes');
    
    console.log('=== TESTE DIRETO DE UPDATE ===\n');
    
    // Testar o mesmo update que o backend está tentando fazer
    const testUpdate = {
      completed: true,
      signedBy: 'Luiz Henrique',
      timestamp: new Date(),
      inspectionNotes: 'Operação concluída com sucesso',
      measurementValue: '54.5mm',
      timeRecord: {
        start: new Date('2024-06-25T10:00:00Z'),
        end: new Date('2024-06-25T11:30:00Z')
      }
    };
    
    console.log('Dados do update:', JSON.stringify(testUpdate, null, 2));
    
    try {
      const result = await db.collection('operations').updateOne(
        { _id: new ObjectId('685a112b69b7b99944c6b2a0') },
        { $set: testUpdate }
      );
      console.log('✅ Update direto funcionou:', result);
    } catch (updateError) {
      console.log('❌ Erro no update direto:', updateError.message);
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

testDirectUpdate(); 