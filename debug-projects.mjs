import fetch from 'node-fetch';

async function debugProjects() {
  try {
    console.log('=== DEBUG PROJETOS ===');
    
    // Buscar projetos
    const projectsResponse = await fetch('http://localhost:3001/api/projects');
    const projects = await projectsResponse.json();
    
    console.log(`Total de projetos encontrados: ${projects.length}`);
    
    if (projects.length > 0) {
      const project = projects[0];
      console.log('\n=== ESTRUTURA DO PRIMEIRO PROJETO ===');
      console.log('_id:', project._id);
      console.log('projectId:', project.projectId);
      console.log('name:', project.name);
      console.log('machine:', project.machine);
      console.log('operations:', project.operations);
      console.log('Tipo de operations:', typeof project.operations);
      console.log('É array?', Array.isArray(project.operations));
      
      if (project.operations) {
        console.log('\n=== OPERAÇÕES ===');
        console.log('Número de operações:', project.operations.length);
        
        project.operations.forEach((op, index) => {
          console.log(`\nOperação ${index + 1}:`);
          console.log('  id:', op.id, '(tipo:', typeof op.id, ')');
          console.log('  sequence:', op.sequence);
          console.log('  type:', op.type);
          console.log('  completed:', op.completed);
          console.log('  signedBy:', op.signedBy);
          console.log('  timestamp:', op.timestamp);
        });
      } else {
        console.log('\n❌ NENHUMA OPERAÇÃO ENCONTRADA');
      }
      
      // Verificar se há operações em uma coleção separada
      console.log('\n=== VERIFICANDO COLEÇÃO DE OPERAÇÕES SEPARADA ===');
      const operationsResponse = await fetch('http://localhost:3001/api/operations');
      const operations = await operationsResponse.json();
      
      console.log(`Operações na coleção separada: ${operations.length}`);
      if (operations.length > 0) {
        console.log('Primeira operação:', operations[0]);
      }
      
    } else {
      console.log('❌ NENHUM PROJETO ENCONTRADO');
    }
    
  } catch (error) {
    console.error('Erro no debug:', error);
  }
}

debugProjects(); 