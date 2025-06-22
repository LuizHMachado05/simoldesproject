export interface Machine {
  _id: string;
  machineId: string;
  name: string;
  password: string;
  status: 'active' | 'maintenance' | 'inactive';
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getMachines(): Promise<Machine[]> {
  const res = await fetch('http://localhost:3001/api/machines');
  return await res.json();
}

export async function searchMachines(query: string): Promise<Machine[]> {
  const all = await getMachines();
  return all.filter(
    machine =>
      machine.name.toLowerCase().includes(query.toLowerCase()) ||
      machine.machineId.toLowerCase().includes(query.toLowerCase())
  );
}

export async function createMachine(machine: Omit<Machine, '_id'>): Promise<Machine> {
  console.log('Enviando dados da máquina para API:', machine);
  const res = await fetch('http://localhost:3001/api/machines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(machine),
  });
  console.log('Resposta da API:', res.status, res.statusText);
  if (!res.ok) {
    const errorData = await res.json();
    console.error('Erro da API:', errorData);
    throw new Error(`Erro ${res.status}: ${errorData.error || res.statusText}`);
  }
  return await res.json();
}

export async function updateMachine(id: string, machine: Partial<Machine>): Promise<void> {
  await fetch(`http://localhost:3001/api/machines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(machine),
  });
}

export async function deleteMachine(id: string): Promise<void> {
  await fetch(`http://localhost:3001/api/machines/${id}`, {
    method: 'DELETE',
  });
} 