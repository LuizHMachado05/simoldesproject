export interface Machine {
  _id: string;
  machineId: string;
  name: string;
  password: string;
  status: 'active' | 'maintenance' | 'inactive';
  role?: 'admin' | 'operator' | 'supervisor';
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  machine?: Omit<Machine, 'password'>;
}

export async function authenticateMachine(machineId: string, password: string): Promise<Machine | null> {
  try {
    console.log('Tentando autenticar máquina:', machineId);
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ machineId, password }),
    });

    const data: AuthResponse = await response.json();

    if (response.ok && data.success && data.machine) {
      console.log('Autenticação bem-sucedida para máquina:', machineId);
      return data.machine as Machine;
    } else {
      console.log('Falha na autenticação:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return null;
  }
}

export async function verifyMachine(machineId: string): Promise<Machine | null> {
  try {
    const response = await fetch(`http://localhost:3001/api/auth/verify?machineId=${machineId}`);
    const data: AuthResponse = await response.json();

    if (response.ok && data.success && data.machine) {
      return data.machine as Machine;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Erro ao verificar máquina:', error);
    return null;
  }
}


