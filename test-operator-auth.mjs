import fetch from 'node-fetch';

async function testOperatorAuth() {
  try {
    console.log('🧪 Testando autenticação de operador...');
    
    // Testar autenticação com matrícula 002 (Luiz Henrique - admin)
    const response = await fetch('http://localhost:3001/api/auth/operator-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        operatorId: '002', 
        password: 'luiz123' 
      })
    });
    
    const data = await response.json();
    
    console.log('📊 Status da resposta:', response.status);
    console.log('📋 Dados retornados:', JSON.stringify(data, null, 2));
    
    if (data.success && data.operator) {
      console.log('✅ Autenticação bem-sucedida!');
      console.log('👤 Nome:', data.operator.name);
      console.log('🔑 Role:', data.operator.role);
      console.log('📝 Matrícula:', data.operator.matricula);
      console.log('🔢 Código:', data.operator.code);
      
      if (data.operator.role === 'admin') {
        console.log('🎯 Operador tem permissão de admin!');
      } else {
        console.log('❌ Operador NÃO tem permissão de admin');
      }
    } else {
      console.log('❌ Falha na autenticação:', data.error);
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

testOperatorAuth(); 