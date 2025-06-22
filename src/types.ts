export interface Operation {
  id: number;
  sequence: string;
  type: 'Furação' | 'Fresamento';
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
}

