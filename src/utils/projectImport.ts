import type { MoldProgram, Operation } from '../types/project';

export function validateAndFormatImportedProject(jsonData: any): MoldProgram | MoldProgram[] {
  // Função para validar e formatar uma única operação
  const formatOperation = (op: any): Operation => {
    // Validar o tipo da operação
    const validType = (type: string): 'Furação' | 'Fresamento' => {
      return type === 'Furação' || type === 'Fresamento' ? type : 'Fresamento';
    };

    return {
      id: op.id || Math.floor(Math.random() * 1000),
      sequence: op.sequence || '',
      type: validType(op.type || 'Fresamento'),
      function: op.function || '',
      centerPoint: op.centerPoint || '',
      toolRef: op.toolRef || '',
      ic: op.ic || '',
      alt: op.alt || '',
      time: {
        machine: op.time?.machine || '',
        total: op.time?.total || ''
      },
      details: {
        depth: op.details?.depth || '',
        speed: op.details?.speed || '',
        feed: op.details?.feed || '',
        coolant: op.details?.coolant || '',
        notes: op.details?.notes || ''
      },
      quality: {
        tolerance: op.quality?.tolerance || '±0.02mm',
        surfaceFinish: op.quality?.surfaceFinish || 'Ra 0.8',
        requirements: op.quality?.requirements || []
      },
      imageUrl: op.imageUrl || '',
      completed: op.completed || false,
      signedBy: op.signedBy || undefined,
      timestamp: op.timestamp || undefined,
      inspectionNotes: op.inspectionNotes,
      timeRecord: op.timeRecord || undefined,
      measurementValue: op.measurementValue || undefined
    };
  };

  // Função para validar e formatar um único projeto
  const formatProject = (project: any): MoldProgram => {
    return {
      id: project.id || `PROJ_${Math.floor(Math.random() * 10000)}`,
      name: project.name || 'Novo Projeto',
      machine: project.machine || '',
      programPath: project.programPath || '',
      material: project.material || '',
      date: project.date || new Date().toLocaleDateString('pt-BR'),
      programmer: project.programmer || '',
      blockCenter: project.blockCenter || 'X0,0 Y0,0',
      reference: project.reference || '',
      observations: project.observations || '',
      imageUrl: project.imageUrl || '',
      status: project.status || 'in_progress',
      operations: Array.isArray(project.operations) 
        ? project.operations.map(formatOperation)
        : []
    };
  };

  try {
    // Verifica se é um array de projetos ou um único projeto
    if (Array.isArray(jsonData)) {
      return jsonData.map(formatProject);
    } else {
      return formatProject(jsonData);
    }
  } catch (error) {
    console.error('Erro ao formatar dados do projeto:', error);
    throw new Error('Formato de dados inválido');
  }
} 