import fetch from 'node-fetch';

async function testOperations() {
  const baseURL = 'http://localhost:3001/api';
  
  try {
    console.log('🧪 Testando carregamento de operações...\n');
    
    // Teste 1: Buscar projetos com operações
    console.log('1. Buscando projetos com operações...');
    const projectsWithOpsResponse = await fetch(`${baseURL}/projects/with-operations`);
    if (projectsWithOpsResponse.ok) {
      const projectsWithOps = await projectsWithOpsResponse.json();
      console.log(`✅ Encontrados ${projectsWithOps.length} projetos com operações`);
      
      if (projectsWithOps.length > 0) {
        const project = projectsWithOps[0];
        console.log('   Primeiro projeto:', {
          _id: project._id,
          projectId: project.projectId,
          name: project.name,
          operationsCount: project.operations?.length || 0
        });
        
        if (project.operations && project.operations.length > 0) {
          console.log('   Primeira operação:', {
            id: project.operations[0].id,
            sequence: project.operations[0].sequence,
            type: project.operations[0].type,
            completed: project.operations[0].completed
          });
        }
      }
    } else {
      console.log('❌ Erro ao buscar projetos com operações:', projectsWithOpsResponse.status);
    }
    
    console.log('\n🎉 Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

testOperations(); 