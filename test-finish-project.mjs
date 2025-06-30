import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

async function testFinishProject() {
  try {
    console.log('Testando rota de finalizar projeto...');
    
    // Primeiro, vamos buscar um projeto para pegar o ID
    const projectsResponse = await fetch(`${API_BASE_URL}/projects`);
    const projects = await projectsResponse.json();
    
    if (!projects || projects.length === 0) {
      console.log('Nenhum projeto encontrado.');
      return;
    }
    
    const project = projects[0];
    console.log('Projeto encontrado:', project.projectId || project._id);
    console.log('Status atual:', project.status);
    
    // Buscar operações do projeto
    const operationsResponse = await fetch(`${API_BASE_URL}/operations`);
    const operations = await operationsResponse.json();
    
    const projectOperations = operations.filter(op => 
      op.projectId === project._id || op.projectId === project.projectId
    );
    
    console.log('Operações do projeto:', projectOperations.length);
    console.log('Operações completadas:', projectOperations.filter(op => op.completed).length);
    console.log('Operações pendentes:', projectOperations.filter(op => !op.completed).length);
    
    // Testar finalização do projeto
    const finishData = {
      projectId: project.projectId || project._id
    };
    
    console.log('Dados para finalização:', finishData);
    
    const finishResponse = await fetch(`${API_BASE_URL}/projects/finish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finishData),
    });
    
    if (finishResponse.ok) {
      const result = await finishResponse.json();
      console.log('✅ Projeto finalizado com sucesso:', result);
    } else {
      const error = await finishResponse.json();
      console.log('❌ Erro na finalização:', error);
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testFinishProject(); 