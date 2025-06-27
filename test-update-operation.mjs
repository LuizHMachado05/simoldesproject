import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

async function testUpdateOperation() {
  try {
    console.log('Testando rota de atualização de operações...');
    
    // Primeiro, vamos buscar um projeto para pegar o ID
    const projectsResponse = await fetch(`${API_BASE_URL}/projects`);
    const projects = await projectsResponse.json();
    
    if (!projects || projects.length === 0) {
      console.log('Nenhum projeto encontrado. Criando dados de teste...');
      return;
    }
    
    const project = projects[0];
    console.log('Projeto encontrado:', project.projectId || project._id);
    
    // Buscar operações do projeto
    const operationsResponse = await fetch(`${API_BASE_URL}/operations`);
    const operations = await operationsResponse.json();
    
    const projectOperations = operations.filter(op => 
      op.projectId === project._id || op.projectId === project.projectId
    );
    
    if (projectOperations.length === 0) {
      console.log('Nenhuma operação encontrada para o projeto.');
      return;
    }
    
    const operation = projectOperations[0];
    console.log('Operação encontrada:', operation.id || operation.sequence);
    
    // Testar atualização da operação
    const updateData = {
      projectId: project.projectId || project._id,
      operationId: operation.id || operation.sequence,
      operatorName: 'Teste Operador',
      startTime: '08:00',
      endTime: '10:30',
      measurement: '12.5',
      notes: 'Teste de atualização via API'
    };
    
    console.log('Dados de atualização:', updateData);
    
    const updateResponse = await fetch(`${API_BASE_URL}/operations/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log('✅ Atualização bem-sucedida:', result);
    } else {
      const error = await updateResponse.text();
      console.log('❌ Erro na atualização:', error);
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testUpdateOperation(); 