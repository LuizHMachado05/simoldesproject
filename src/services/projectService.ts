export interface Project {
  _id: string;
  projectId: string;
  name: string;
  machine: string;
  programPath?: string;
  material?: string;
  date: Date;
  programmer?: string;
  blockCenter?: string;
  reference?: string;
  observations?: string;
  imageUrl?: string;
  status?: 'in_progress' | 'completed';
  completedDate?: Date;
  totalTime?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE_URL}/api/projects`);
  return await res.json();
}

export async function getProjectsWithOperations(machine?: string): Promise<Project[]> {
  let url = `${API_BASE_URL}/api/projects/with-operations`;
  if (machine) {
    url += `?machine=${encodeURIComponent(machine)}`;
  }
  const res = await fetch(url);
  return await res.json();
}

export async function searchProjects(query: string): Promise<Project[]> {
  const all = await getProjects();
  return all.filter(
    project =>
      project.name.toLowerCase().includes(query.toLowerCase()) ||
      project.projectId.toLowerCase().includes(query.toLowerCase())
  );
}

export async function createProject(project: Omit<Project, '_id'>): Promise<Project> {
  console.log('Enviando dados do projeto para API:', project);
  const res = await fetch(`${API_BASE_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  console.log('Resposta da API:', res.status, res.statusText);
  if (!res.ok) {
    const errorData = await res.json();
    console.error('Erro da API:', errorData);
    throw new Error(`Erro ${res.status}: ${errorData.error || res.statusText}`);
  }
  return await res.json();
}

export async function updateProject(id: string, project: Partial<Project>): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`Erro ${res.status}: ${errorData.error || res.statusText}`);
  }
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
    method: 'DELETE',
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`Erro ${res.status}: ${errorData.error || res.statusText}`);
  }
}

export async function getProjectWithOperationsById(projectId: string): Promise<Project> {
  const res = await fetch(`${API_BASE_URL}/api/projects/with-operations/${projectId}`);
  return await res.json();
}

export async function finishProject(projectId: string): Promise<{ success: boolean; message: string; completedDate: Date }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/finish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erro ao finalizar projeto:', error);
    throw error;
  }
} 