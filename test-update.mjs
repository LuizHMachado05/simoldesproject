import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes';
const client = new MongoClient(uri);

async function testUpdate() {
  try {
    console.log('Conectando ao MongoDB Atlas...');
    await client.connect();
    console.log('✅ Conectado!');
    
    const db = client.db('simoldes');
    
    // Buscar o projeto
    const project = await db.collection('projects').findOne({ projectId: '1668_18' });
    console.log('Projeto encontrado:', project._id);
    
    // Testar atualização da operação
    const operationFilter = { 
      projectId: project._id,
      id: 1 
    };
    
    const updateData = {
      completed: true,
      signedBy: 'Teste Operador',
      timestamp: new Date(),
      inspectionNotes: 'Teste de assinatura via API',
      timeRecord: {
        start: new Date('2025-06-24T08:00:00Z'),
        end: new Date('2025-06-24T10:00:00Z')
      },
      measurementValue: '10.5mm'
    };
    
    console.log('Tentando atualizar operação...');
    console.log('Filtro:', operationFilter);
    console.log('Dados:', updateData);
    
    const result = await db.collection('operations').updateOne(
      operationFilter,
      { $set: updateData }
    );
    
    console.log('Resultado:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount
    });
    
    if (result.matchedCount > 0) {
      console.log('✅ Operação atualizada com sucesso!');
      
      // Verificar se foi atualizada
      const updatedOperation = await db.collection('operations').findOne(operationFilter);
      console.log('Operação atualizada:', {
        id: updatedOperation.id,
        completed: updatedOperation.completed,
        signedBy: updatedOperation.signedBy,
        timestamp: updatedOperation.timestamp
      });
    } else {
      console.log('❌ Operação não encontrada');
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
  }
}

testUpdate(); 