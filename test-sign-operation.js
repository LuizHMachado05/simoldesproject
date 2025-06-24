const fetch = require('node-fetch');

async function testSignOperation() {
  try {
    // Primeiro, buscar um projeto para obter o projectId
    console.log('Buscando projetos...');
    const projectsResponse = await fetch('http://localhost:3001/api/projects');
    const projects = await projectsResponse.json();
    
    if (!projects || projects.length === 0) {
      console.log('Nenhum projeto encontrado');
      return;
    }
    
    const project = projects[0];
    console.log('Projeto encontrado:', {
      _id: project._id,
      projectId: project.projectId,
      name: project.name,
      operations: project.operations?.length || 0
    });
    
    if (!project.operations || project.operations.length === 0) {
      console.log('Nenhuma operação encontrada no projeto');
      return;
    }
    
    const operation = project.operations[0];
    console.log('Operação encontrada:', {
      id: operation.id,
      sequence: operation.sequence,
      completed: operation.completed
    });
    
    // Testar assinatura
    const signData = {
      projectId: project.projectId || project._id,
      operationId: operation.id,
      operatorName: 'Teste Operador',
      startTime: '08:00',
      endTime: '10:00',
      measurement: '10.5mm',
      notes: 'Teste de assinatura via API'
    };
    
    console.log('Enviando dados de assinatura:', signData);
    
    const signResponse = await fetch('http://localhost:3001/api/operations/sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signData),
    });
    
    const signResult = await signResponse.json();
    console.log('Resposta da assinatura:', {
      status: signResponse.status,
      result: signResult
    });
    
    if (signResponse.ok) {
      console.log('✅ Assinatura realizada com sucesso!');
      
      // Verificar se a operação foi atualizada
      const updatedProjectResponse = await fetch(`http://localhost:3001/api/projects/${project._id}`);
      const updatedProject = await updatedProjectResponse.json();
      
      const updatedOperation = updatedProject.operations.find(op => op.id === operation.id);
      console.log('Operação atualizada:', {
        id: updatedOperation.id,
        completed: updatedOperation.completed,
        signedBy: updatedOperation.signedBy,
        timestamp: updatedOperation.timestamp
      });
    } else {
      console.log('❌ Erro na assinatura:', signResult);
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testSignOperation(); 