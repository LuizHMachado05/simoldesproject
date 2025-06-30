const fetch = require('node-fetch');

async function testProjectsAPI() {
  const baseURL = 'http://localhost:3001/api';
  
  try {
    console.log('🧪 Testando API de Projetos...\n');
    
    // Teste 1: Buscar todos os projetos
    console.log('1. Buscando todos os projetos...');
    const projectsResponse = await fetch(`${baseURL}/projects`);
    if (projectsResponse.ok) {
      const projects = await projectsResponse.json();
      console.log(`✅ Encontrados ${projects.length} projetos`);
      if (projects.length > 0) {
        console.log('   Primeiro projeto:', {
          _id: projects[0]._id,
          projectId: projects[0].projectId,
          name: projects[0].name,
          machine: projects[0].machine
        });
      }
    } else {
      console.log('❌ Erro ao buscar projetos:', projectsResponse.status);
    }
    
    // Teste 2: Buscar projetos com operações
    console.log('\n2. Buscando projetos com operações...');
    const projectsWithOpsResponse = await fetch(`${baseURL}/projects/with-operations`);
    if (projectsWithOpsResponse.ok) {
      const projectsWithOps = await projectsWithOpsResponse.json();
      console.log(`✅ Encontrados ${projectsWithOps.length} projetos com operações`);
      if (projectsWithOps.length > 0) {
        console.log('   Primeiro projeto com operações:', {
          _id: projectsWithOps[0]._id,
          projectId: projectsWithOps[0].projectId,
          name: projectsWithOps[0].name,
          operationsCount: projectsWithOps[0].operations?.length || 0
        });
      }
    } else {
      console.log('❌ Erro ao buscar projetos com operações:', projectsWithOpsResponse.status);
    }
    
    // Teste 3: Criar um novo projeto
    console.log('\n3. Criando um novo projeto de teste...');
    const newProject = {
      projectId: 'TEST001',
      name: 'Projeto de Teste',
      machine: 'F1400',
      material: 'Aço',
      date: new Date().toISOString(),
      programmer: 'Teste',
      status: 'in_progress'
    };
    
    const createResponse = await fetch(`${baseURL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProject)
    });
    
    if (createResponse.ok) {
      const createdProject = await createResponse.json();
      console.log('✅ Projeto criado com sucesso:', {
        _id: createdProject._id,
        projectId: createdProject.projectId,
        name: createdProject.name
      });
      
      // Teste 4: Atualizar o projeto
      console.log('\n4. Atualizando o projeto...');
      const updateData = { status: 'completed' };
      const updateResponse = await fetch(`${baseURL}/projects/${createdProject._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (updateResponse.ok) {
        console.log('✅ Projeto atualizado com sucesso');
      } else {
        console.log('❌ Erro ao atualizar projeto:', updateResponse.status);
      }
      
      // Teste 5: Deletar o projeto
      console.log('\n5. Deletando o projeto...');
      const deleteResponse = await fetch(`${baseURL}/projects/${createdProject._id}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        console.log('✅ Projeto deletado com sucesso');
      } else {
        console.log('❌ Erro ao deletar projeto:', deleteResponse.status);
      }
    } else {
      const errorData = await createResponse.json();
      console.log('❌ Erro ao criar projeto:', createResponse.status, errorData);
    }
    
    console.log('\n🎉 Testes concluídos!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

testProjectsAPI(); 