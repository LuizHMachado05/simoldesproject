export interface Operation {
  id: number;
  sequence: string;
  type: 'Furação' | 'Fresamento' | 'Roscar' | 'Desbaste por Offset';
  function: string;
  centerPoint: string;
  toolRef: string;
  ic: string;
  alt: string;
  time: {
    machine: string;
    total: string;
  };
  details: {
    depth: string;
    speed: string;
    feed: string;
    coolant: string;
    notes?: string;
  };
  quality: {
    tolerance: string;
    surfaceFinish: string;
    requirements: string[];
  };
  measurements: {
    required: {
      id: string;
      description: string;
      nominal: string;
      tolerance: string;
    }[];
    actual?: {
      value: string;
      timestamp: string;
      measuredBy: string;
    }[];
  };
  execution?: {
    startTime: string;
    endTime: string;
    duration: string;
    operator: string;
  };
  completed: boolean;
  signedBy?: string; // Nome do operador que assinou
  machineId?: string; // ID da máquina que executou a operação
  timestamp?: string;
  inspectionNotes?: string;
  timeRecord?: {
    start: string;
    end: string;
  };
  measurementValue?: string;
  imageUrl: string;

  // --- Novos campos da folha de processo ---
  'Programa': string;
  'Tipo Percurso': string;
  'Ref.': string;
  'Comentário': string;
  'Ø RC': string;
  'Ferramenta': string;
  'Rib.': string;
  'Alt.': string;
  'Z min': string;
  'Lat.2D': string;
  'Sob. Esp.': string;
  'Passo Lat.': string;
  'Passo Vert.': string;
  'Tol.': string;
  'Rot.': string;
  'Av.': string;
  'Ângulo': string;
  'Plano Trab.': string;
  'Tempo Corte': string;
  'Tempo Total': string;
  'Medição': string;
  'Rubrica': string;
  'Fresa': string;
  'Sup.': string;
}

