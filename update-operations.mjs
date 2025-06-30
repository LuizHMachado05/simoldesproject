import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes';
const client = new MongoClient(uri);

async function updateOperations() {
  try {
    console.log('Conectando ao MongoDB Atlas...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');
    
    const db = client.db('simoldes');
    const operationsCollection = db.collection('operations');
    
    // Buscar todas as operações
    console.log('Buscando operações...');
    const operations = await operationsCollection.find({}).toArray();
    console.log(`Encontradas ${operations.length} operações`);
    
    // Agrupar por projectId
    const grouped = {};
    for (const op of operations) {
      const pid = String(op.projectId);
      if (!grouped[pid]) grouped[pid] = [];
      grouped[pid].push(op);
    }
    
    console.log(`Projetos com operações: ${Object.keys(grouped).length}`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Para cada projeto, atualizar as operações
    for (const [projectId, ops] of Object.entries(grouped)) {
      console.log(`\nProcessando projeto ${projectId} com ${ops.length} operações`);
      
      // Ordenar por sequence
      ops.sort((a, b) => {
        const seqA = parseInt(a.sequence) || 0;
        const seqB = parseInt(b.sequence) || 0;
        return seqA - seqB;
      });
      
      // Atribuir IDs numéricos
      for (let i = 0; i < ops.length; i++) {
        const op = ops[i];
        
        // Verificar se já tem id numérico
        if (typeof op.id === 'number') {
          console.log(`  Operação ${op.sequence} já tem id: ${op.id}`);
          skippedCount++;
          continue;
        }
        
        const newId = i + 1;
        await operationsCollection.updateOne(
          { _id: op._id },
          { $set: { id: newId } }
        );
        
        console.log(`  Operação ${op.sequence} → id: ${newId}`);
        updatedCount++;
      }
    }
    
    console.log(`\n✅ Atualização concluída!`);
    console.log(`  - Operações atualizadas: ${updatedCount}`);
    console.log(`  - Operações que já tinham id: ${skippedCount}`);
    
    // Verificar resultado
    console.log('\nVerificando resultado...');
    const updatedOperations = await operationsCollection.find({}).toArray();
    for (const op of updatedOperations.slice(0, 3)) { // Mostrar primeiras 3
      console.log(`  Operação: sequence=${op.sequence}, id=${op.id}, type=${op.type}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
    console.log('Conexão fechada');
  }
}

updateOperations(); 