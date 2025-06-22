export interface Log {
  _id: string;
  type: 'Login' | 'Operação' | 'Erro' | 'Manutenção' | 'Sistema' | 'Segurança';
  user: string;
  machine: string;
  timestamp: Date;
  details: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  sessionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LogFilters {
  type?: string;
  user?: string;
  machine?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export async function getLogs(filters?: LogFilters): Promise<Log[]> {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value.toString());
      }
    });
  }
  
  const url = `http://localhost:3001/api/logs${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error(`Erro ${res.status}: ${res.statusText}`);
  }
  
  return await res.json();
}

export async function searchLogs(query: string): Promise<Log[]> {
  const all = await getLogs();
  return all.filter(
    log =>
      log.user.toLowerCase().includes(query.toLowerCase()) ||
      log.machine.toLowerCase().includes(query.toLowerCase()) ||
      log.details.toLowerCase().includes(query.toLowerCase()) ||
      log.type.toLowerCase().includes(query.toLowerCase())
  );
}

export async function createLog(log: Omit<Log, '_id' | 'timestamp' | 'createdAt' | 'updatedAt'>): Promise<Log> {
  console.log('Enviando log para API:', log);
  const res = await fetch('http://localhost:3001/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  });
  
  console.log('Resposta da API:', res.status, res.statusText);
  if (!res.ok) {
    const errorData = await res.json();
    console.error('Erro da API:', errorData);
    throw new Error(`Erro ${res.status}: ${errorData.error || res.statusText}`);
  }
  
  return await res.json();
}

export async function updateLog(id: string, log: Partial<Log>): Promise<void> {
  await fetch(`http://localhost:3001/api/logs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  });
}

export async function deleteLog(id: string): Promise<void> {
  await fetch(`http://localhost:3001/api/logs/${id}`, {
    method: 'DELETE',
  });
}

export async function clearOldLogs(days: number = 30): Promise<{ deletedCount: number }> {
  const res = await fetch(`http://localhost:3001/api/logs?days=${days}`, {
    method: 'DELETE',
  });
  
  if (!res.ok) {
    throw new Error(`Erro ${res.status}: ${res.statusText}`);
  }
  
  return await res.json();
}

// Função utilitária para criar logs automaticamente
export async function logActivity(
  type: Log['type'],
  user: string,
  machine: string,
  details: string,
  severity: Log['severity'] = 'low'
): Promise<void> {
  try {
    await createLog({
      type,
      user,
      machine,
      details,
      severity,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Erro ao criar log de atividade:', error);
  }
}

// Funções específicas para tipos de log comuns
export async function logLogin(user: string, machine: string, success: boolean = true): Promise<void> {
  await logActivity(
    'Login',
    user,
    machine,
    success ? 'Login bem-sucedido' : 'Tentativa de login falhou',
    success ? 'low' : 'medium'
  );
}

export async function logOperation(user: string, machine: string, operation: string): Promise<void> {
  await logActivity(
    'Operação',
    user,
    machine,
    `Operação: ${operation}`,
    'low'
  );
}

export async function logError(user: string, machine: string, error: string): Promise<void> {
  await logActivity(
    'Erro',
    user,
    machine,
    `Erro: ${error}`,
    'high'
  );
}

export async function logMaintenance(user: string, machine: string, details: string): Promise<void> {
  await logActivity(
    'Manutenção',
    user,
    machine,
    `Manutenção: ${details}`,
    'medium'
  );
} 