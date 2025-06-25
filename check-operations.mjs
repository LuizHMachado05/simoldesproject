import fetch from 'node-fetch';

async function checkOperations() {
  try {
    console.log('=== VERIFICANDO OPERAÇÕES ===\n');
    
    // Buscar projeto com operações
    const response = await fetch('http://localhost:3001/api/projects/with-operations/1671_32');
    const project = await response.json();
    
    console.log('Projeto:', {
      _id: project._id,
      projectId: project.projectId,
      name: project.name
    });
    
    console.log('\nOperações:');
    if (project.operations && project.operations.length > 0) {
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
      console.log('  Nenhuma operação encontrada');
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

checkOperations(); 