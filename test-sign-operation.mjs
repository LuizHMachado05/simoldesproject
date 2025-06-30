import fetch from 'node-fetch';

async function testSignOperation() {
  try {
    const testData = {
      projectId: "685a112b69b7b99944c6b29f", // ObjectId do projeto da operação do backend
      operationId: "07", // Sequence da operação do backend
      operatorName: "Luiz Henrique",
      startTime: "2024-06-25T10:00:00Z",
      endTime: "2024-06-25T11:30:00Z",
      measurement: "54.5mm",
      notes: "Operação concluída com sucesso"
    };

    console.log('Testando rota de assinatura...');
    console.log('Dados enviados:', testData);

    const response = await fetch('http://localhost:3001/api/operations/sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('Status da resposta:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Resposta de sucesso:', result);
    } else {
      const error = await response.text();
      console.log('Erro na resposta:', error);
    }
  } catch (error) {
    console.error('Erro ao testar:', error);
  }
}

testSignOperation(); 