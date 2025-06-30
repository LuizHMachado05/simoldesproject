import fetch from 'node-fetch';

async function testBackendConnection() {
  try {
    console.log('=== TESTANDO CONEXÃO DO BACKEND ===\n');
    
    // Testar health
    const healthResponse = await fetch('http://localhost:3001/api/health');
    console.log('Health check:', healthResponse.status);
    
    // Testar busca de operações
    const opsResponse = await fetch('http://localhost:3001/api/operations');
    console.log('Operações:', opsResponse.status);
    if (opsResponse.ok) {
      const ops = await opsResponse.json();
      console.log('Total de operações:', ops.length);
      if (ops.length > 0) {
        const firstOp = ops[0];
        console.log('Primeira operação:');
        console.log('  _id:', firstOp._id);
        console.log('  projectId:', firstOp.projectId, 'tipo:', typeof firstOp.projectId);
        console.log('  createdAt:', firstOp.createdAt, 'tipo:', typeof firstOp.createdAt);
        console.log('  updatedAt:', firstOp.updatedAt, 'tipo:', typeof firstOp.updatedAt);
      }
    }
    
    // Testar busca de projetos
    const projectsResponse = await fetch('http://localhost:3001/api/projects');
    console.log('Projetos:', projectsResponse.status);
    if (projectsResponse.ok) {
      const projects = await projectsResponse.json();
      console.log('Total de projetos:', projects.length);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

testBackendConnection(); 