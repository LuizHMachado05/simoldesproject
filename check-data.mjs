import fetch from 'node-fetch';

async function checkData() {
  try {
    console.log('=== VERIFICANDO DADOS DA API ===');
    
    // Verificar projetos com operações
    const response = await fetch('http://localhost:3001/api/projects/with-operations');
    const projects = await response.json();
    
    console.log(`Projetos retornados: ${projects.length}`);
    
    if (projects.length > 0) {
      const project = projects[0];
      console.log('\nProjeto:', {
        _id: project._id,
        projectId: project.projectId,
        name: project.name,
        operationsCount: project.operations?.length || 0
      });
      
      if (project.operations && project.operations.length > 0) {
        console.log('\nOperações:');
        project.operations.forEach((op, index) => {
          console.log(`  ${index + 1}.`, {
            _id: op._id,
            id: op.id,
            sequence: op.sequence,
            type: op.type,
            completed: op.completed
          });
        });
      } else {
        console.log('❌ Nenhuma operação encontrada no projeto');
      }
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

checkData(); 