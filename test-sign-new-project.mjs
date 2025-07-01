import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testSignNewProject() {
  console.log('=== TESTE DE ASSINATURA NO PROJETO TEST_001 ===\n');
  
  try {
    // 1. Buscar o projeto TEST_001
    console.log('1. Buscando projeto TEST_001...');
    const projectsResponse = await fetch(`${API_BASE}/projects/with-operations`);
    const projects = await projectsResponse.json();
    
    const testProject = projects.find(p => p.projectId === 'TEST_001');
    if (!testProject) {
      console.log('❌ Projeto TEST_001 não encontrado');
      return;
    }
    
    console.log(`✅ Projeto encontrado: ${testProject.name}`);
    console.log(`   ProjectId: ${testProject.projectId}`);
    console.log(`   _id: ${testProject._id}`);
    console.log(`   Operações: ${testProject.operations?.length || 0}`);
    
    if (!testProject.operations || testProject.operations.length === 0) {
      console.log('❌ Nenhuma operação encontrada no projeto');
      return;
    }
    
    // 2. Testar assinatura da primeira operação
    const firstOperation = testProject.operations[0];
    console.log(`\n2. Testando assinatura da operação: ${firstOperation.sequence}`);
    console.log(`   ID: ${firstOperation.id}, Sequence: ${firstOperation.sequence}`);
    console.log(`   Tipo: ${firstOperation.type}, Função: ${firstOperation.function}`);
    console.log(`   Completed: ${firstOperation.completed}`);
    
    const signData = {
      projectId: testProject.projectId, // 'TEST_001'
      operationId: firstOperation.id, // 1
      operatorName: 'Teste Operador',
      startTime: '2024-01-01T08:00:00.000Z',
      endTime: '2024-01-01T10:00:00.000Z',
      measurement: '10.5',
      notes: 'Teste de assinatura no projeto TEST_001'
    };
    
    console.log('\n3. Enviando dados de assinatura:');
    console.log('   projectId:', signData.projectId);
    console.log('   operationId:', signData.operationId, '(tipo:', typeof signData.operationId, ')');
    console.log('   operatorName:', signData.operatorName);
    
    const signResponse = await fetch(`${API_BASE}/operations/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signData)
    });
    
    console.log(`\n4. Status da resposta: ${signResponse.status}`);
    
    if (signResponse.ok) {
      const result = await signResponse.json();
      console.log('✅ Assinatura realizada com sucesso!');
      console.log('Resultado:', result);
      
      // 5. Verificar se a operação foi atualizada
      console.log('\n5. Verificando se a operação foi atualizada...');
      const updatedProjectsResponse = await fetch(`${API_BASE}/projects/with-operations`);
      const updatedProjects = await updatedProjectsResponse.json();
      const updatedProject = updatedProjects.find(p => p.projectId === 'TEST_001');
      
      if (updatedProject) {
        const updatedOperation = updatedProject.operations.find(op => op.sequence === firstOperation.sequence);
        if (updatedOperation) {
          console.log('✅ Operação atualizada:');
          console.log('   Completed:', updatedOperation.completed);
          console.log('   Signed by:', updatedOperation.signedBy);
          console.log('   Timestamp:', updatedOperation.timestamp);
          console.log('   Measurement:', updatedOperation.measurementValue);
          console.log('   Notes:', updatedOperation.inspectionNotes);
        } else {
          console.log('❌ Operação não encontrada após atualização');
        }
      }
    } else {
      const errorData = await signResponse.json();
      console.log('❌ Erro na assinatura:');
      console.log('Status:', signResponse.status);
      console.log('Erro:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testSignNewProject(); 