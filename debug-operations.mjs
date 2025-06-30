import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function debugOperations() {
  console.log('Debugando estrutura das operações...\n');
  
  try {
    // 1. Buscar projetos
    const projectsResponse = await fetch(`${API_BASE}/projects`);
    const projects = await projectsResponse.json();
    const firstProject = projects[0];
    
    console.log(`Projeto: ${firstProject.projectId} (ID: ${firstProject._id})`);
    
    // 2. Buscar operações
    const operationsResponse = await fetch(`${API_BASE}/operations?projectId=${firstProject._id}`);
    const operations = await operationsResponse.json();
    
    console.log(`\nOperações encontradas (${operations.length}):`);
    operations.slice(0, 5).forEach((op, index) => {
      console.log(`\n${index + 1}. Operação:`);
      console.log(`   _id: ${op._id}`);
      console.log(`   id: ${op.id} (tipo: ${typeof op.id})`);
      console.log(`   sequence: ${op.sequence} (tipo: ${typeof op.sequence})`);
      console.log(`   projectId: ${op.projectId} (tipo: ${typeof op.projectId})`);
      console.log(`   completed: ${op.completed}`);
      console.log(`   signedBy: ${op.signedBy}`);
    });
    
    // 3. Testar diferentes formas de buscar a primeira operação
    const firstOp = operations[0];
    console.log(`\nTestando busca da operação: ${firstOp.sequence}`);
    
    const testCases = [
      { name: 'Por ID numérico', operationId: firstOp.id },
      { name: 'Por sequence string', operationId: firstOp.sequence },
      { name: 'Por sequence como número', operationId: parseInt(firstOp.sequence) }
    ];
    
    for (const testCase of testCases) {
      console.log(`\nTeste: ${testCase.name}`);
      console.log(`Valor: ${testCase.operationId} (tipo: ${typeof testCase.operationId})`);
      
      const signData = {
        projectId: firstProject.projectId,
        operationId: testCase.operationId,
        operatorName: 'Teste Debug',
        startTime: '2024-01-01T08:00:00.000Z',
        endTime: '2024-01-01T10:00:00.000Z',
        measurement: '10.5',
        notes: 'Teste de debug'
      };
      
      const signResponse = await fetch(`${API_BASE}/operations/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signData)
      });
      
      if (signResponse.ok) {
        const result = await signResponse.json();
        console.log(`✓ Sucesso: ${result.message}`);
      } else {
        const errorData = await signResponse.json();
        console.log(`❌ Erro: ${errorData.error}`);
      }
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

debugOperations(); 