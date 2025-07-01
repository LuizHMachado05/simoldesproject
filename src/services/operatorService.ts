export interface Operator {
  _id: string;
  name: string;
  code: string;
  role: 'admin' | 'operator' | 'supervisor';
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  matricula?: string;
  cargo?: string;
  turno?: string;
}

export interface OperatorAuthResponse {
  success: boolean;
  operator?: Operator;
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function getOperators(): Promise<Operator[]> {
  const res = await fetch(`${API_BASE_URL}/api/operators`);
  return await res.json();
}

export async function searchOperators(query: string): Promise<Operator[]> {
  const all = await getOperators();
  return all.filter(
    op =>
      op.name.toLowerCase().includes(query.toLowerCase()) ||
      op.code.toLowerCase().includes(query.toLowerCase())
  );
}

export async function createOperator(operator: Omit<Operator, '_id'>): Promise<Operator> {
  console.log('Enviando dados para API:', operator);
  const res = await fetch(`${API_BASE_URL}/api/operators`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(operator),
  });
  console.log('Resposta da API:', res.status, res.statusText);
  if (!res.ok) {
    const errorData = await res.json();
    console.error('Erro da API:', errorData);
    throw new Error(`Erro ${res.status}: ${errorData.error || res.statusText}`);
  }
  return await res.json();
}

export async function updateOperator(id: string, operator: Partial<Operator>): Promise<void> {
  await fetch(`${API_BASE_URL}/api/operators/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(operator),
  });
}

export async function deleteOperator(id: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/operators/${id}`, {
    method: 'DELETE',
  });
}

export async function authenticateOperator(code: string, password: string): Promise<Operator | null> {
  try {
    console.log('Tentando autenticar operador:', { code, password: '***' });
    
    const response = await fetch(`${API_BASE_URL}/api/auth/operator-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorId: code, password })
    });
    
    const data: OperatorAuthResponse = await response.json();
    
    console.log('Resposta da API:', data);
    
    if (response.ok && data.success && data.operator) {
      console.log('Operador autenticado com sucesso:', data.operator.name, 'Role:', data.operator.role);
      return data.operator;
    } else {
      console.log('Falha na autenticação:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Erro na autenticação do operador:', error);
    return null;
  }
}
