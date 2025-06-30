import fetch from 'node-fetch';

async function testMinimalUpdate() {
  try {
    console.log('=== TESTE DE UPDATE MÍNIMO ===\n');
    
    // Testar com dados válidos do projeto 1671_32
    const minimalData = {
      projectId: "1671_32",
      operationId: "01",
      operatorName: "Teste",
      startTime: "2024-06-25T10:00:00Z",
      endTime: "2024-06-25T11:30:00Z",
      measurement: "10mm"
    };
    
    console.log('Dados mínimos:', minimalData);
    
    const response = await fetch('http://localhost:3001/api/operations/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(minimalData)
    });
    
    console.log('Status:', response.status);
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Sucesso:', result);
    } else {
      const error = await response.text();
      console.log('❌ Erro:', error);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

testMinimalUpdate(); 