import fetch from 'node-fetch';

async function testSignReal() {
  try {
    console.log('=== TESTE DE ASSINATURA COM DADOS REAIS ===');
    
    // Buscar projetos com operações
    const projectsResponse = await fetch('http://localhost:3001/api/projects/with-operations');
    const projects = await projectsResponse.json();
    
    console.log(`Projetos encontrados: ${projects.length}`);
    
    if (projects.length === 0) {
      console.log('❌ Nenhum projeto encontrado');
      return;
    }
    
    const project = projects[0];
    console.log('Projeto:', project.name);
    console.log('ProjectId:', project.projectId);
    console.log('_id:', project._id);
    
    if (!project.operations || project.operations.length === 0) {
      console.log('❌ Nenhuma operação encontrada');
      return;
    }
    
    const operation = project.operations[0];
    console.log('Operação:', {
      _id: operation._id,
      sequence: operation.sequence,
      type: operation.type,
      completed: operation.completed
    });
    
    // Testar assinatura
    const signData = {
      projectId: project.projectId, // Usar projectId (string)
      operationId: operation.id, // Usar o id numérico da operação
      operatorName: 'Teste Operador',
      startTime: '08:00',
      endTime: '10:00',
      measurement: '10.5mm',
      notes: 'Teste de assinatura via API'
    };
    
    console.log('\nEnviando dados de assinatura:', signData);
    
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
      const updatedProjectsResponse = await fetch('http://localhost:3001/api/projects/with-operations');
      const updatedProjects = await updatedProjectsResponse.json();
      const updatedProject = updatedProjects.find(p => p.projectId === project.projectId);
      
      if (updatedProject) {
        const updatedOperation = updatedProject.operations.find(op => op.sequence === operation.sequence);
        console.log('Operação atualizada:', {
          sequence: updatedOperation.sequence,
          completed: updatedOperation.completed,
          signedBy: updatedOperation.signedBy,
          timestamp: updatedOperation.timestamp
        });
      }
    } else {
      console.log('❌ Erro na assinatura:', signResult);
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testSignReal(); 