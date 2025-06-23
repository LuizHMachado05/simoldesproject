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

export async function getProjects(): Promise<Project[]> {
  const res = await fetch('http://localhost:3001/api/projects');
  return await res.json();
}

export async function getProjectsWithOperations(): Promise<Project[]> {
  const res = await fetch('http://localhost:3001/api/projects/with-operations');
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
  const res = await fetch('http://localhost:3001/api/projects', {
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
  await fetch(`http://localhost:3001/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await fetch(`http://localhost:3001/api/projects/${id}`, {
    method: 'DELETE',
  });
} 