import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testSignOperation() {
  console.log('Testando assinatura de operação...\n');
  
  try {
    // 1. Primeiro, buscar projetos disponíveis
    console.log('1. Buscando projetos...');
    const projectsResponse = await fetch(`${API_BASE}/projects`);
    if (!projectsResponse.ok) {
      throw new Error(`Erro ao buscar projetos: ${projectsResponse.status}`);
    }
    const projects = await projectsResponse.json();
    console.log(`✓ ${projects.length} projetos encontrados`);
    
    if (projects.length === 0) {
      console.log('❌ Nenhum projeto encontrado para testar');
      return;
    }
    
    // 2. Buscar operações do primeiro projeto
    const firstProject = projects[0];
    console.log(`\n2. Buscando operações do projeto: ${firstProject.projectId}`);
    
    const operationsResponse = await fetch(`${API_BASE}/operations?projectId=${firstProject._id}`);
    if (!operationsResponse.ok) {
      throw new Error(`Erro ao buscar operações: ${operationsResponse.status}`);
    }
    const operations = await operationsResponse.json();
    console.log(`✓ ${operations.length} operações encontradas`);
    
    if (operations.length === 0) {
      console.log('❌ Nenhuma operação encontrada para testar');
      return;
    }
    
    // 3. Testar assinatura da primeira operação
    const firstOperation = operations[0];
    console.log(`\n3. Testando assinatura da operação: ${firstOperation.sequence} (ID: ${firstOperation.id})`);
    
    const signData = {
      projectId: firstProject.projectId,
      operationId: firstOperation.id,
      operatorName: 'Teste Operador',
      startTime: '2024-01-01T08:00:00.000Z',
      endTime: '2024-01-01T10:00:00.000Z',
      measurement: '10.5',
      notes: 'Teste de assinatura via API'
    };
    
    console.log('Dados de assinatura:', signData);
    
    const signResponse = await fetch(`${API_BASE}/operations/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signData)
    });
    
    console.log(`Status da resposta: ${signResponse.status}`);
    
    if (signResponse.ok) {
      const result = await signResponse.json();
      console.log('✓ Assinatura realizada com sucesso!');
      console.log('Resultado:', result);
    } else {
      const errorData = await signResponse.json();
      console.log('❌ Erro na assinatura:');
      console.log('Status:', signResponse.status);
      console.log('Erro:', errorData);
    }
    
    // 4. Verificar se a operação foi atualizada
    console.log('\n4. Verificando se a operação foi atualizada...');
    const updatedOperationsResponse = await fetch(`${API_BASE}/operations?projectId=${firstProject._id}`);
    const updatedOperations = await updatedOperationsResponse.json();
    
    const updatedOperation = updatedOperations.find(op => op.id === firstOperation.id);
    if (updatedOperation) {
      console.log('✓ Operação encontrada após atualização');
      console.log('Status completed:', updatedOperation.completed);
      console.log('Signed by:', updatedOperation.signedBy);
      console.log('Measurement:', updatedOperation.measurementValue);
      console.log('Notes:', updatedOperation.inspectionNotes);
    } else {
      console.log('❌ Operação não encontrada após atualização');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testSignOperation(); 