import fetch from 'node-fetch';

async function testBackendMongoDB() {
  try {
    console.log('=== TESTANDO BACKEND MONGODB ===\n');
    
    // Testar operações
    const opsResponse = await fetch('http://localhost:3001/api/operations');
    if (opsResponse.ok) {
      const ops = await opsResponse.json();
      console.log('Operações do backend:', ops.length);
      
      // Encontrar uma operação que ainda não foi assinada
      const unsignedOp = ops.find(op => !op.completed);
      
      if (unsignedOp) {
        console.log('Operação não assinada encontrada:');
        console.log('  _id:', unsignedOp._id);
        console.log('  projectId:', unsignedOp.projectId);
        console.log('  sequence:', unsignedOp.sequence);
        console.log('  completed:', unsignedOp.completed);
        
        // Tentar fazer um update simples via API
        console.log('\nTestando update via API...');
        const updateResponse = await fetch('http://localhost:3001/api/operations/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: unsignedOp.projectId,
            operationId: unsignedOp.sequence,
            operatorName: 'Teste API',
            startTime: '2024-06-25T10:00:00Z',
            endTime: '2024-06-25T11:30:00Z',
            measurement: '10mm',
            notes: 'Teste via API'
          })
        });
        
        console.log('Status do update via API:', updateResponse.status);
        if (updateResponse.ok) {
          const result = await updateResponse.json();
          console.log('✅ Update via API funcionou:', result);
        } else {
          const error = await updateResponse.text();
          console.log('❌ Erro no update via API:', error);
        }
      } else {
        console.log('Nenhuma operação não assinada encontrada');
      }
    } else {
      console.log('Erro ao buscar operações:', opsResponse.status);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

testBackendMongoDB(); 