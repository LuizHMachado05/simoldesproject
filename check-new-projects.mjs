import fetch from 'node-fetch';

async function checkNewProjects() {
  console.log('🔍 Verificando novos projetos F1400 no banco de dados...');
  
  try {
    // Verificar projetos
    const projectsResponse = await fetch('http://localhost:3001/api/projects');
    const projects = await projectsResponse.json();
    
    console.log(`📊 Total de projetos encontrados: ${projects.length}`);
    
    // Filtrar projetos F1400
    const f1400Projects = projects.filter(p => p.machine === 'F1400');
    console.log(`🔧 Projetos F1400 encontrados: ${f1400Projects.length}`);
    
    if (f1400Projects.length > 0) {
      console.log('\n📋 Lista de projetos F1400:');
      f1400Projects.forEach((project, index) => {
        console.log(`${index + 1}. ${project.projectId} - ${project.name}`);
        console.log(`   Status: ${project.status}`);
        console.log(`   Data: ${project.date}`);
        console.log(`   Programador: ${project.programmer}`);
        console.log('---');
      });
    }
    
    // Verificar operações
    console.log('\n🔍 Verificando operações...');
    const operationsResponse = await fetch('http://localhost:3001/api/operations');
    const operations = await operationsResponse.json();
    
    console.log(`📊 Total de operações encontradas: ${operations.length}`);
    
    // Verificar operações dos novos projetos
    const newProjectIds = ['1670_30', '1671_31'];
    const newProjectOperations = operations.filter(op => 
      newProjectIds.includes(op.projectId) || 
      (op.project && newProjectIds.includes(op.project.projectId))
    );
    
    console.log(`🔧 Operações dos novos projetos encontradas: ${newProjectOperations.length}`);
    
    if (newProjectOperations.length > 0) {
      console.log('\n📋 Operações dos novos projetos:');
      newProjectOperations.forEach((op, index) => {
        console.log(`${index + 1}. Projeto: ${op.projectId || op.project?.projectId}`);
        console.log(`   Sequência: ${op.sequence}`);
        console.log(`   Tipo: ${op.type} - ${op.function}`);
        console.log(`   Ferramenta: ${op.toolRef}`);
        console.log(`   Status: ${op.completed ? 'Completa' : 'Pendente'}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar projetos:', error.message);
  }
}

checkNewProjects(); 