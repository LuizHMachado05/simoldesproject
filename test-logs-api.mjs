import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testLogsAPI() {
  console.log('Testando API de logs...\n');
  
  try {
    // Teste 1: Criar alguns logs de exemplo
    const sampleLogs = [
      {
        type: 'Login',
        user: 'F1400',
        machine: 'F1400',
        details: 'Login bem-sucedido',
        severity: 'low'
      },
      {
        type: 'Login',
        user: 'João Silva',
        machine: 'F1400',
        details: 'Login bem-sucedido',
        severity: 'low'
      },
      {
        type: 'Operação',
        user: 'João Silva',
        machine: 'F1400',
        details: 'Operação 001 assinada no projeto 1670_20',
        severity: 'low'
      },
      {
        type: 'Operação',
        user: 'João Silva',
        machine: 'F1400',
        details: 'Operação 002 assinada no projeto 1670_20',
        severity: 'low'
      },
      {
        type: 'Operação',
        user: 'Maria Santos',
        machine: 'F1400',
        details: 'Projeto 1670_20 finalizado',
        severity: 'low'
      },
      {
        type: 'Login',
        user: 'Admin',
        machine: 'Sistema',
        details: 'Acesso ao painel administrativo',
        severity: 'low'
      },
      {
        type: 'Operação',
        user: 'Admin',
        machine: 'Sistema',
        details: 'Operador João Silva (OP12345) criado com role operator',
        severity: 'low'
      },
      {
        type: 'Operação',
        user: 'Admin',
        machine: 'Sistema',
        details: 'Máquina Fresadora CNC 1400 (F1400) criada',
        severity: 'low'
      },
      {
        type: 'Operação',
        user: 'Admin',
        machine: 'Sistema',
        details: 'Projeto MOLDE LATERAL ESQUERDO (1670_20) criado para máquina F1400',
        severity: 'low'
      },
      {
        type: 'Erro',
        user: 'F1400',
        machine: 'F1400',
        details: 'Tentativa de login falhou - senha incorreta',
        severity: 'medium'
      },
      {
        type: 'Login',
        user: 'F1400',
        machine: 'F1400',
        details: 'Login bem-sucedido',
        severity: 'low'
      },
      {
        type: 'Operação',
        user: 'Admin',
        machine: 'Sistema',
        details: 'Dados da aba users atualizados com sucesso',
        severity: 'low'
      }
    ];
    
    console.log('Criando logs de exemplo...');
    for (const log of sampleLogs) {
      const response = await fetch(`${API_BASE}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
      
      if (response.ok) {
        const createdLog = await response.json();
        console.log(`✓ Log criado: ${log.type} - ${log.user} - ${log.details}`);
      } else {
        console.log(`✗ Erro ao criar log: ${response.status} ${response.statusText}`);
      }
    }
    
    // Teste 2: Buscar todos os logs
    console.log('\nBuscando todos os logs...');
    const getResponse = await fetch(`${API_BASE}/logs`);
    if (getResponse.ok) {
      const logs = await getResponse.json();
      console.log(`✓ ${logs.length} logs encontrados`);
      
      // Mostrar os 5 logs mais recentes
      console.log('\nLogs mais recentes:');
      logs.slice(0, 5).forEach(log => {
        const date = new Date(log.timestamp).toLocaleString('pt-BR');
        console.log(`- ${date} | ${log.type} | ${log.user} | ${log.details}`);
      });
    } else {
      console.log(`✗ Erro ao buscar logs: ${getResponse.status} ${getResponse.statusText}`);
    }
    
    // Teste 3: Testar filtros
    console.log('\nTestando filtros...');
    const filterResponse = await fetch(`${API_BASE}/logs?type=Login&limit=3`);
    if (filterResponse.ok) {
      const filteredLogs = await filterResponse.json();
      console.log(`✓ ${filteredLogs.length} logs de login encontrados`);
    } else {
      console.log(`✗ Erro ao filtrar logs: ${filterResponse.status} ${filterResponse.statusText}`);
    }
    
    console.log('\n✅ Teste da API de logs concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testLogsAPI(); 