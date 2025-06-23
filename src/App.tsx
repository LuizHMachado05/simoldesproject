import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  ClipboardList, 
  LayoutDashboard, 
  History, 
  LogOut, 
  User, 
  Settings, 
  Bell, 
  Info, 
  CheckCircle2, 
  ArrowLeft,
  Factory,
  PenTool as Tool,
  AlertTriangle,
  Eye,
  RefreshCw,
  LogIn,
  Lock,
  ArrowUp,
  Clock,
  Target,
  Activity,
  TrendingUp,
  Maximize2,
  Shield,
  Save,
  FileSpreadsheet
} from 'lucide-react';
import { OperatorSearchModal } from './components/OperatorSearchModal';
import { OperationActions } from './components/OperationActions';
import { authenticateMachine } from './services/authService';
import { getProjectsWithOperations } from './services/projectService';
import { AdminPanel } from './components/AdminPanel'; // Importando o componente AdminPanel

const IMAGES = {
  logo: `${import.meta.env.BASE_URL}simoldeslogo.png`,
  loginCapa: `${import.meta.env.BASE_URL}Capa Simoldes.png`,
  programCapa: `${import.meta.env.BASE_URL}2d.png`,
  operation: `${import.meta.env.BASE_URL}operation.png`,
  operation2d: `${import.meta.env.BASE_URL}2d.png`,
};

// Helper function to format dates
const formatDate = (date: string | Date | undefined): string => {
  if (!date) return 'N/A';
  if (typeof date === 'string') {
    return date;
  }
  return date.toLocaleDateString('pt-BR');
};

interface Machine {
  id: string;
  name: string;
}

interface Operation {
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
  imageUrl: string;
  completed: boolean;
  signedBy?: string;
  timestamp?: string;
  inspectionNotes?: string;
  timeRecord?: {
    start: string;
    end: string;
  };
  measurementValue?: string;
}

interface MoldProgram {
  _id?: string;
  id?: string;
  projectId?: string;
  name: string;
  machine: string;
  programPath: string;
  material: string;
  date: string | Date;
  programmer: string;
  blockCenter: string;
  reference: string;
  observations: string;
  imageUrl?: string;
  status?: 'in_progress' | 'completed';
  completedDate?: string | Date;
  operations: Operation[];
}

const historicPrograms: MoldProgram[] = [
  {
    id: '1665_15',
    name: 'MOLDE LATERAL DIREITO',
    machine: 'F1400',
    programPath: 'U:/F1400/1665_15',
    material: '1730',
    date: '05/02/2024',
    programmer: 'diego.verciano',
    blockCenter: 'X0,0 Y0,0',
    reference: 'EM Z: 15,0',
    observations: 'VERIFICAR ALINHAMENTO INICIAL',
    imageUrl: IMAGES.programCapa,
    operations: [
      {
        id: 1,
        sequence: '04',
        type: 'Furação',
        function: 'Pré-furo',
        centerPoint: '42',
        toolRef: 'BK_DRILL_D38_SSD_701800022',
        ic: '235',
        alt: '260',
        time: {
          machine: '09:15:00',
          total: '09:45:30'
        },
        details: {
          depth: '85mm',
          speed: '2800 RPM',
          feed: '0.12mm/rev',
          coolant: 'Externa 45 bar'
        },
        quality: {
          tolerance: '±0.02mm',
          surfaceFinish: 'Ra 0.8',
          requirements: ['Verificar circularidade']
        },
        imageUrl: IMAGES.operation,
        completed: true,
        signedBy: 'carlos.silva',
        timestamp: '05/02/2024 09:45:30',
        timeRecord: {
          start: '09:15:00',
          end: '09:45:30'
        },
        measurementValue: '37.98'
      },
      {
        id: 2,
        sequence: '05',
        type: 'Fresamento',
        function: 'Acabamento lateral',
        centerPoint: '38',
        toolRef: 'BK_FINISH_D32_SSD_701800045',
        ic: '190',
        alt: '215',
        time: {
          machine: '10:00:00',
          total: '10:45:00'
        },
        details: {
          depth: '55mm',
          speed: '3500 RPM',
          feed: '0.08mm/rev',
          coolant: 'Externa 50 bar'
        },
        quality: {
          tolerance: '±0.01mm',
          surfaceFinish: 'Ra 0.4',
          requirements: ['Medir planicidade', 'Verificar acabamento']
        },
        imageUrl: IMAGES.operation,
        completed: true,
        signedBy: 'carlos.silva',
        timestamp: '05/02/2024 10:45:00',
        timeRecord: {
          start: '10:00:00',
          end: '10:45:00'
        },
        measurementValue: '54.99'
      }
    ]
  },
  {
    id: '1666_16',
    name: 'MOLDE BASE SUPERIOR',
    machine: 'F1600',
    programPath: 'U:/F1600/1666_16',
    material: '1740',
    date: '06/02/2024',
    programmer: 'ana.santos',
    blockCenter: 'X0,0 Y0,0',
    reference: 'EM Z: 25,0',
    observations: 'USAR SUPORTE ESPECIAL',
    imageUrl: IMAGES.programCapa,
    operations: [
      {
        id: 1,
        sequence: '06',
        type: 'Fresamento',
        function: 'Desbaste',
        centerPoint: '52',
        toolRef: 'BK_ROUGH_D63_SSD_701800078',
        ic: '280',
        alt: '305',
        time: {
          machine: '13:30:00',
          total: '14:15:00'
        },
        details: {
          depth: '95mm',
          speed: '2200 RPM',
          feed: '0.18mm/rev',
          coolant: 'Externa 55 bar'
        },
        quality: {
          tolerance: '±0.05mm',
          surfaceFinish: 'Ra 1.6',
          requirements: ['Verificar profundidade']
        },
        imageUrl: IMAGES.operation,
        completed: true,
        signedBy: 'roberto.oliveira',
        timestamp: '06/02/2024 14:15:00',
        timeRecord: {
          start: '13:30:00',
          end: '14:15:00'
        },
        measurementValue: '94.97'
      },
      {
        id: 2,
        sequence: '07',
        type: 'Fresamento',
        function: 'Acabamento',
        centerPoint: '45',
        toolRef: 'BK_FINISH_D40_SSD_701800089',
        ic: '225',
        alt: '250',
        time: {
          machine: '14:30:00',
          total: '15:30:00'
        },
        details: {
          depth: '95mm',
          speed: '3000 RPM',
          feed: '0.1mm/rev',
          coolant: 'Externa 60 bar'
        },
        quality: {
          tolerance: '±0.01mm',
          surfaceFinish: 'Ra 0.4',
          requirements: ['Medir rugosidade', 'Verificar dimensional']
        },
        imageUrl: IMAGES.operation,
        completed: true,
        signedBy: 'roberto.oliveira',
        timestamp: '06/02/2024 15:30:00',
        timeRecord: {
          start: '14:30:00',
          end: '15:30:00'
        },
        measurementValue: '95.00'
      }
    ]
  },
  {
    id: '1667_17',
    name: 'MOLDE CAVIDADE CENTRAL',
    machine: 'F1400',
    programPath: 'U:/F1400/1667_17',
    material: '1730',
    date: '07/02/2024',
    programmer: 'pedro.oliveira',
    blockCenter: 'X0,0 Y0,0',
    reference: 'EM Z: 30,0',
    observations: 'REFRIGERAÇÃO ESPECIAL',
    imageUrl: IMAGES.programCapa,
    operations: [
      {
        id: 1,
        sequence: '08',
        type: 'Furação',
        function: 'Furos de refrigeração',
        centerPoint: '58',
        toolRef: 'BK_DRILL_D12_SSD_701800099',
        ic: '150',
        alt: '175',
        time: {
          machine: '08:00:00',
          total: '09:00:00'
        },
        details: {
          depth: '150mm',
          speed: '4000 RPM',
          feed: '0.08mm/rev',
          coolant: 'Interna 70 bar'
        },
        quality: {
          tolerance: '±0.02mm',
          surfaceFinish: 'Ra 0.8',
          requirements: ['Verificar profundidade', 'Medir circularidade']
        },
        imageUrl: IMAGES.operation,
        completed: true,
        signedBy: 'maria.santos',
        timestamp: '07/02/2024 09:00:00',
        timeRecord: {
          start: '08:00:00',
          end: '09:00:00'
        },
        measurementValue: '12.01'
      },
      {
        id: 2,
        sequence: '09',
        type: 'Fresamento',
        function: 'Acabamento cavidade',
        centerPoint: '50',
        toolRef: 'BK_FINISH_D16_SSD_701800100',
        ic: '165',
        alt: '190',
        time: {
          machine: '09:30:00',
          total: '11:00:00'
        },
        details: {
          depth: '80mm',
          speed: '4500 RPM',
          feed: '0.05mm/rev',
          coolant: 'Externa 65 bar'
        },
        quality: {
          tolerance: '±0.008mm',
          surfaceFinish: 'Ra 0.2',
          requirements: ['Medir rugosidade', 'Verificar geometria']
        },
        imageUrl: IMAGES.operation,
        completed: true,
        signedBy: 'maria.santos',
        timestamp: '07/02/2024 11:00:00',
        timeRecord: {
          start: '09:30:00',
          end: '11:00:00'
        },
        measurementValue: '79.992'
      }
    ]
  }
];

function App() {
  const [machineId, setMachineId] = useState(''); // Alterado de operatorId para machineId
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProgram, setSelectedProgram] = useState<MoldProgram | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [signModal, setSignModal] = useState({
    isOpen: false,
    operationId: null as number | null,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedOperations, setExpandedOperations] = useState<number[]>([]);
  const [programs, setPrograms] = useState<MoldProgram[]>([]); // Inicializar vazio
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do banco de dados
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setIsLoading(true);
        const projectsData = await getProjectsWithOperations();
        
        // Converter dados do banco para o formato MoldProgram
        const convertedPrograms: MoldProgram[] = projectsData.map(project => ({
          _id: project._id,
          id: project.projectId, // Usar projectId como id para compatibilidade
          projectId: project.projectId,
          name: project.name,
          machine: project.machine,
          programPath: project.programPath || '',
          material: project.material || '',
          date: project.date,
          programmer: project.programmer || '',
          blockCenter: project.blockCenter || '',
          reference: project.reference || '',
          observations: project.observations || '',
          imageUrl: project.imageUrl || IMAGES.programCapa,
          status: project.status,
          completedDate: project.completedDate,
          operations: (project as any).operations || [] // Adicionar operações se existirem
        }));
        
        setPrograms(convertedPrograms);
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        // Fallback para dados mockados em caso de erro
        setPrograms(historicPrograms);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrograms();
  }, []);

  const toggleOperationExpand = (operationId: number) => {
    setExpandedOperations(prev => 
      prev.includes(operationId) 
        ? prev.filter(id => id !== operationId) 
        : [...prev, operationId]
    );
  };

  const handleOperationClick = (operation: Operation) => {
    setSelectedOperation(operation);
  };

  const moldPrograms: MoldProgram[] = [
    {
      id: '1668_18',
      name: 'MOLDE CARCAÇA FRONTAL',
      machine: 'F1400',
      programPath: 'U:/F1400/1668_18',
      material: '1730',
      date: '10/02/2025',
      programmer: 'diego.verciano',
      blockCenter: 'X0,0 Y0,0',
      reference: 'EM Z: 20,0',
      observations: 'PRENDER SOBRE CALÇOS DE 10mm',
      imageUrl: IMAGES.programCapa,
      status: 'in_progress', // Status padrão
      operations: [
        {
          id: 1,
          sequence: '07',
          type: 'Furação',
          function: 'Centro',
          centerPoint: '48',
          toolRef: 'BK_TOPDRIL_D44_SSD_701800011',
          ic: '247',
          alt: '273',
          time: {
            machine: '10:30:12',
            total: '10:38:15',
          },
          details: {
            depth: '120mm',
            speed: '2400 RPM',
            feed: '0.15mm/rev',
            coolant: 'Externa 40 bar',
            notes: 'Verificar alinhamento antes de iniciar',
          },
          quality: {
            tolerance: '±0.008mm',
            surfaceFinish: 'Ra 0.2',
            requirements: [
              'Verificar concentricidade',
              'Medir circularidade',
              'Controle 100% dimensional',
            ],
          },
          imageUrl: IMAGES.operation,
          completed: false,
        },
        {
          id: 2,
          sequence: '08',
          type: 'Fresamento',
          function: 'Desbaste',
          centerPoint: '52',
          toolRef: 'BK_MILL_D63_SSD_701800022',
          ic: '280',
          alt: '295',
          time: {
            machine: '09:30:00',
            total: '09:45:15',
          },
          details: {
            depth: '85mm',
            speed: '2800 RPM',
            feed: '0.18mm/rev',
            coolant: 'Externa 45 bar',
            notes: 'Realizar desbaste em 3 passes',
          },
          quality: {
            tolerance: '±0.05mm',
            surfaceFinish: 'Ra 1.6',
            requirements: [
              'Verificar profundidade entre passes',
              'Monitorar temperatura',
            ],
          },
          imageUrl: IMAGES.operation,
          completed: false,
        },
        {
          id: 3,
          sequence: '09',
          type: 'Fresamento',
          function: 'Acabamento',
          centerPoint: '35',
          toolRef: 'BK_FINISH_D25_SSD_701800033',
          ic: '180',
          alt: '195',
          time: {
            machine: '14:15:00',
            total: '14:45:30',
          },
          details: {
            depth: '65mm',
            speed: '3200 RPM',
            feed: '0.08mm/rev',
            coolant: 'Externa 50 bar',
            notes: 'Acabamento fino nas paredes',
          },
          quality: {
            tolerance: '±0.01mm',
            surfaceFinish: 'Ra 0.4',
            requirements: [
              'Medir rugosidade em 5 pontos',
              'Verificar paralelismo',
            ],
          },
          imageUrl: IMAGES.operation,
          completed: false,
        }
      ]
    },
    {
      id: '1669_22',
      name: 'MOLDE TAMPA SUPERIOR',
      machine: 'F1600',
      programPath: 'U:/F1600/1669_22',
      material: '1740',
      date: '12/02/2025',
      programmer: 'ana.santos',
      blockCenter: 'X0,0 Y0,0',
      reference: 'EM Z: 30,0',
      observations: 'UTILIZAR SUPORTE ESPECIAL',
      imageUrl: IMAGES.programCapa,
      operations: [
        {
          id: 1,
          sequence: '05',
          type: 'Furação',
          function: 'Pré-furo',
          centerPoint: '40',
          toolRef: 'BK_DRILL_D32_SSD_701800044',
          ic: '220',
          alt: '245',
          time: {
            machine: '11:00:00',
            total: '11:45:20',
          },
          details: {
            depth: '75mm',
            speed: '2900 RPM',
            feed: '0.10mm/rev',
            coolant: 'Interna 60 bar',
            notes: 'Controle dimensional crítico',
          },
          quality: {
            tolerance: '±0.008mm',
            surfaceFinish: 'Ra 0.2',
            requirements: [
              'Verificar concentricidade',
              'Medir circularidade',
              'Controle 100% dimensional',
            ],
          },
          imageUrl: IMAGES.operation,
          completed: false,
        }
      ]
    },
    {
      id: '1670_31',
      name: 'MOLDE BASE INFERIOR',
      machine: 'F1400',
      programPath: 'U:/F1400/1670_31',
      material: '1730',
      date: '15/02/2025',
      programmer: 'pedro.oliveira',
      blockCenter: 'X0,0 Y0,0',
      reference: 'EM Z: 25,0',
      observations: 'VERIFICAR PLANICIDADE DA BASE',
      imageUrl: IMAGES.programCapa,
      operations: [
        {
          id: 1,
          sequence: '03',
          type: 'Fresamento',
          function: 'Desbaste Base',
          centerPoint: '55',
          toolRef: 'BK_MILL_D80_SSD_701800055',
          ic: '300',
          alt: '320',
          time: {
            machine: '13:00:00',
            total: '13:30:00',
          },
          details: {
            depth: '45mm',
            speed: '2200 RPM',
            feed: '0.20mm/rev',
            coolant: 'Externa 50 bar',
            notes: 'Desbaste em 2 passes',
          },
          quality: {
            tolerance: '±0.03mm',
            surfaceFinish: 'Ra 1.2',
            requirements: [
              'Verificar planicidade',
              'Medir espessura final',
            ],
          },
          imageUrl: IMAGES.operation,
          completed: false,
        }
      ]
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (machineId.trim() && password.trim()) {
      try {
        // Mostra um feedback visual de que está processando
        const loginButton = e.currentTarget.querySelector('button[type="submit"]');
        if (loginButton) {
          loginButton.innerHTML = '<span class="animate-spin mr-2">⟳</span> Verificando...';
          loginButton.setAttribute('disabled', 'true');
        }
        
        const machine = await authenticateMachine(machineId, password);
        
        if (machine) {
          // Login bem-sucedido - define o estado como autenticado
          setIsAuthenticated(true);
          // Não precisamos restaurar o botão aqui, pois a tela de login será substituída pela tela principal
        } else {
          // Login falhou - restaura o botão e mostra mensagem
          alert('Código de máquina ou senha inválidos');
          if (loginButton) {
            loginButton.innerHTML = '<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg> Acessar Sistema';
            loginButton.removeAttribute('disabled');
          }
        }
      } catch (error) {
        console.error('Erro ao fazer login:', error);
        alert('Erro ao processar o login. Tente novamente.');
        
        // Restaura o botão em caso de erro
        const loginButton = e.currentTarget.querySelector('button[type="submit"]');
        if (loginButton) {
          loginButton.innerHTML = '<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg> Acessar Sistema';
          loginButton.removeAttribute('disabled');
        }
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setMachineId('');
    setPassword('');
  };

  const handleOperationCheck = (operationId: number) => {
    if (!selectedProgram) return;

    // Remova esta parte que verifica operações anteriores
    /*
    const operationIndex = selectedProgram.operations.findIndex(
      (op) => op.id === operationId
    );
    const previousOperations = selectedProgram.operations.slice(0, operationIndex);
    const allPreviousCompleted = previousOperations.every((op) => op.completed);

    if (!allPreviousCompleted) {
      alert('Por favor, complete as operações anteriores primeiro.');
      return;
    }
    */

    // Simplesmente abra o modal de assinatura
    setSignModal({
      isOpen: true,
      operationId,
    });
  };

  const handleSignConfirm = (data: {
    startTime: string;
    endTime: string;
    measurement: string;
    operatorName: string; 
    notes?: string;
  }) => {
    if (!selectedProgram || !signModal.operationId) return;

    setSelectedProgram({
      ...selectedProgram,
      operations: selectedProgram.operations.map((op) =>
        op.id === signModal.operationId
          ? {
              ...op,
              completed: true,
              signedBy: data.operatorName, // Usa o nome do operador fornecido
              timestamp: new Date().toLocaleString(),
              inspectionNotes: data.notes,
              timeRecord: {
                start: data.startTime,
                end: data.endTime,
              },
              measurementValue: data.measurement,
            }
          : op
      ),
    });

    setSignModal({ isOpen: false, operationId: null });
  };

  const handleRefresh = (tab: string) => {
    setIsRefreshing(true);
    
    // Simular tempo de carregamento
    setTimeout(() => {
      setIsRefreshing(false);
      
      // Recarregar dados do banco se for a aba de projetos
      if (tab === 'dashboard') {
        const loadPrograms = async () => {
          try {
            const projectsData = await getProjectsWithOperations();
            
            // Converter dados do banco para o formato MoldProgram
            const convertedPrograms: MoldProgram[] = projectsData.map(project => ({
              _id: project._id,
              id: project.projectId,
              projectId: project.projectId,
              name: project.name,
              machine: project.machine,
              programPath: project.programPath || '',
              material: project.material || '',
              date: project.date,
              programmer: project.programmer || '',
              blockCenter: project.blockCenter || '',
              reference: project.reference || '',
              observations: project.observations || '',
              imageUrl: project.imageUrl || IMAGES.programCapa,
              status: project.status,
              completedDate: project.completedDate,
              operations: (project as any).operations || []
            }));
            
            setPrograms(convertedPrograms);
          } catch (error) {
            console.error('Erro ao recarregar projetos:', error);
          }
        };
        
        loadPrograms();
      }
    }, 1000);
  };

  const refreshIconClass = `h-4 w-4 transition-transform duration-1000 ${
    isRefreshing ? 'animate-spin' : ''
  }`;

  const handleTimeChange = (operationId: number, type: 'start' | 'end', value: string) => {
    if (!selectedProgram) return;
    
    setSelectedProgram({
      ...selectedProgram,
      operations: selectedProgram.operations.map((op): Operation =>
        op.id === operationId
          ? {
              ...op,
              timeRecord: {
                start: type === 'start' ? value : (op.timeRecord?.start || ''),
                end: type === 'end' ? value : (op.timeRecord?.end || ''),
              },
            }
          : op
      ),
    });
  };

  const handleMeasurementChange = (operationId: number, value: string) => {
    if (!selectedProgram) return;
    
    setSelectedProgram({
      ...selectedProgram,
      operations: selectedProgram.operations.map((op) =>
        op.id === operationId
          ? {
              ...op,
              measurementValue: value,
            }
          : op
      ),
    });
  };

  const handleNotesChange = (operationId: number, value: string) => {
    if (!selectedProgram) return;
    
    setSelectedProgram({
      ...selectedProgram,
      operations: selectedProgram.operations.map((op) =>
        op.id === operationId
          ? {
              ...op,
              inspectionNotes: value,
            }
          : op
      ),
    });
  };

  const handleOperationComplete = (operationId: number) => {
    if (!selectedProgram) return;
    
    const operation = selectedProgram.operations.find(op => op.id === operationId);
    if (!operation?.timeRecord?.start || !operation?.timeRecord?.end || !operation?.measurementValue) {
      // Adicione aqui a lógica para mostrar um erro ao usuário
      return;
    }

    setSelectedProgram({
      ...selectedProgram,
      operations: selectedProgram.operations.map((op) =>
        op.id === operationId
          ? {
              ...op,
              completed: true,
              signedBy: machineId, // Usar machineId em vez de operatorId
              timestamp: new Date().toLocaleString(),
            }
          : op
      ),
    });
  };

  const handleFinishProject = (projectId: string) => {
    if (!selectedProgram) return;
    
    const now = new Date();
    const completedDate = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');
    
    // Atualizar o estado local
    setPrograms((prevPrograms: MoldProgram[]) => 
      prevPrograms.map(prog => 
        prog.id === projectId 
          ? { ...prog, status: 'completed', completedDate } 
          : prog
      )
    );
    
    // Atualizar o projeto selecionado
    setSelectedProgram({
      ...selectedProgram,
      status: 'completed',
      completedDate
    });
    
    alert("Projeto finalizado com sucesso!");
  };

  const handleExportLogs = (projectId: string) => {
    if (!selectedProgram) return;
    
    // Calculate total project time if completed
    let totalProjectTime = '';
    if (selectedProgram.status === 'completed' && selectedProgram.completedDate) {
      const firstOp = selectedProgram.operations[0];
      const firstTime = firstOp?.timeRecord?.start;
      if (firstTime) {
        const startDate = new Date(selectedProgram.date + ' ' + firstTime);
        const endDate = new Date(selectedProgram.completedDate);
        const diffInHours = Math.abs(endDate.getTime() - startDate.getTime()) / 36e5;
        totalProjectTime = diffInHours.toFixed(2) + ' horas';
      }
    }
    
    // Criar dados para exportação
    const exportData = selectedProgram.operations.map(op => ({
      'ID Projeto': selectedProgram.id,
      'Nome Projeto': selectedProgram.name,
      'Máquina': selectedProgram.machine,
      'Data Início': selectedProgram.date,
      'Data Conclusão': selectedProgram.completedDate || 'Em andamento',
      'Tempo Total Projeto': totalProjectTime || 'Em andamento',
      'Status Projeto': selectedProgram.status === 'completed' ? 'Concluído' : 'Em andamento',
      'Sequência': op.sequence,
      'Tipo Operação': op.type,
      'Função': op.function,
      'Ferramenta': op.toolRef || 'N/A',
      'Status': op.completed ? 'Concluído' : 'Pendente',
      'Operador': op.signedBy || 'N/A',
      'Data/Hora': op.timestamp || 'N/A',
      'Início': op.timeRecord?.start || 'N/A',
      'Término': op.timeRecord?.end || 'N/A',
      'Valor Medição': op.measurementValue || 'N/A',
    }));
    
    // Criar planilha Excel
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
    
    // Ajustar largura das colunas
    const maxWidth = exportData.reduce((w, r) => Math.max(w, r['Nome Projeto'].length), 10);
    worksheet['!cols'] = [
      { wch: 10 }, // ID Projeto
      { wch: maxWidth }, // Nome Projeto
      { wch: 10 }, // Máquina
      { wch: 12 }, // Data Início
      { wch: 12 }, // Data Conclusão
      { wch: 15 }, // Tempo Total Projeto
      { wch: 15 }, // Status Projeto
      { wch: 10 }, // Sequência
      { wch: 15 }, // Tipo Operação
      { wch: 15 }, // Função
      { wch: 20 }, // Ferramenta
      { wch: 12 }, // Status
      { wch: 15 }, // Operador
      { wch: 20 }, // Data/Hora
      { wch: 10 }, // Início
      { wch: 10 }, // Término
      { wch: 15 }, // Valor Medição
    ];
    
    // Gerar nome do arquivo
    const fileName = `${selectedProgram.id}_${selectedProgram.name.replace(/\s+/g, '_')}_logs.xlsx`;
    
    // Exportar arquivo
    XLSX.writeFile(workbook, fileName);
    
    // Notificar o usuário
    alert(`Logs exportados com sucesso para o arquivo "${fileName}"`);
  };

  if (!isAuthenticated) {
    return (
      <div className="login-background">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white p-0 max-w-5xl w-full flex flex-col md:flex-row overflow-hidden rounded-2xl shadow-2xl">
            {/* Left side - Login form */}
            <div className="w-full md:w-1/2 login-overlay p-6 md:p-12 flex flex-col justify-center">
              <div className="mb-8">
                <img
                  src={IMAGES.logo}
                  alt="Simoldes Logo"
                  className="h-12 mb-6"
                />
                <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo</h1>
                <p className="text-gray-200 text-sm">
                  Sistema de Controle de Projetos
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="machineId" className="block text-sm font-medium text-white mb-2">
                    Código da Máquina
                  </label>
                  <div className="relative">
                    <Factory className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="machineId"
                      value={machineId}
                      onChange={(e) => setMachineId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-[#04514B] bg-white text-lg"
                      placeholder="Digite o código da máquina"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-[#04514B] bg-white text-lg"
                      placeholder="••••••"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-white mr-2 focus:ring-[#04514B] focus:ring-offset-0 text-[#04514B]"
                    />
                    <span className="text-white">Lembrar-me</span>
                  </label>
                  <button 
                    type="button"
                    onClick={() => alert('Por favor, contate o suporte técnico.')}
                    className="text-white hover:underline"
                  >
                    Esqueci a senha
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-white text-[#04514B] rounded-xl font-medium hover:bg-gray-100 transition-colors text-lg flex items-center justify-center gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  Acessar Sistema
                </button>
              </form>
            </div>
            
            {/* Right side - Image */}
            <div className="hidden md:block md:w-1/2 relative">
              <img
                src={IMAGES.loginCapa}
                alt="Simoldes Manufacturing"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="main-layout">
        {/* Header/Topbar */}
        <header className="bg-primary shadow-lg">
          <div className="container mx-auto">
            <div className="flex justify-between items-center h-24 px-6">
              {/* Left - Logo */}
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setSelectedProgram(null);
                  setSelectedOperation(null);
                }}
                className="hover:opacity-80 transition-opacity"
              >
                <img
                  src={IMAGES.logo}
                  alt="Simoldes Aços Logo"
                  className="h-12"
                />
              </button>

              {/* Center - Title */}
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2">
                <h1 className="text-2xl font-semibold text-white">
                  Sistema de Controle
                </h1>
              </div>

              {/* Right - Actions */}
              <div className="flex items-center">
                {/* Notifications */}
                <button className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors mx-2">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Settings */}
                <button className="p-2 text-white hover:bg-white/10 rounded-full transition-colors mx-2">
                  <Settings className="h-6 w-6" />
                </button>

                {/* User Info */}
                <div className="flex items-center ml-6 pl-6 border-l border-white/20">
                  <div className="mr-4 text-right">
                    <p className="text-white text-sm font-medium">{machineId}</p>
                    <p className="text-white/60 text-xs">Máquina</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col md:flex-row">
          {/* Sidebar - Mobile Dropdown */}
          <div className="md:hidden bg-white p-4 border-b border-gray-200">
            <select 
              value={activeTab}
              onChange={(e) => {
                setActiveTab(e.target.value);
                setSelectedProgram(null);
              }}
              className="w-full p-2 rounded-lg border border-gray-300 text-sm"
            >
              <option value="dashboard">Dashboard</option>
              <option value="projects">Projetos</option>
              <option value="history">Histórico</option>
              <option value="admin">Administração</option> {/* Adicionada opção de administração */}
            </select>
          </div>

          {/* Sidebar - Desktop */}
          <aside className="hidden md:block w-64 min-h-[calc(100vh-6rem)] bg-white border-r border-gray-200 shadow-sm">
            {/* User Profile Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{machineId}</h3>
                  <p className="text-xs text-gray-500">Máquina</p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="p-4 space-y-1">
              {/* Principal */}
              <div className="mb-6">
                <h4 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Principal
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setSelectedProgram(null);
                      setSelectedOperation(null);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'dashboard'
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('projects');
                      setSelectedProgram(null);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'projects'
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ClipboardList className="h-5 w-5" />
                    <span className="text-sm font-medium">Projetos</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('history');
                      setSelectedProgram(null);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'history'
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <History className="h-5 w-5" />
                    <span className="text-sm font-medium">Histórico</span>
                  </button>

                  {/* Botão de Administração adicionado */}
                  <button
                    onClick={() => {
                      setActiveTab('admin');
                      setSelectedProgram(null);
                      setSelectedOperation(null);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'admin'
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Shield className="h-5 w-5" />
                    <span className="text-sm font-medium">Administração</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm font-medium">Sair</span>
                  </button>
                </div>
              </div>
            </nav>
          </aside>

          <main className="flex-1 p-4 md:p-8">
            {activeTab === 'dashboard' && !selectedProgram && (
              <div className="space-y-8">
                {/* Header com estatísticas principais */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Visão Geral</h2>
                      <p className="text-gray-500 mt-1">Acompanhamento em tempo real</p>
                    </div>
                    <button 
                      onClick={() => handleRefresh('dashboard')} 
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <RefreshCw className={refreshIconClass} />
                      <span>Atualizar</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1 - Projetos Ativos */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-emerald-600">Projetos Ativos</p>
                          <h3 className="text-3xl font-bold text-gray-900 mt-2">{programs.length}</h3>
                        </div>
                        <div className="bg-emerald-100 p-3 rounded-lg">
                          <ClipboardList className="h-6 w-6 text-emerald-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm text-emerald-600">
                        <ArrowUp className="h-4 w-4 mr-1" />
                        <span>12% mais que o mês anterior</span>
                      </div>
                    </div>

                    {/* Card 2 - Em Andamento */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Em Andamento</p>
                          <h3 className="text-3xl font-bold text-gray-900 mt-2">
                            {programs.filter(p => p.operations.some(op => !op.completed)).length}
                          </h3>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Tool className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm text-blue-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>4 aguardando validação</span>
                      </div>
                    </div>

                    {/* Card 3 - Concluídos Hoje */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Concluídos Hoje</p>
                          <h3 className="text-3xl font-bold text-gray-900 mt-2">
                            {programs.filter(p => p.operations.every(op => op.completed)).length}
                          </h3>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                          <CheckCircle2 className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm text-purple-600">
                        <Target className="h-4 w-4 mr-1" />
                        <span>Meta diária: 8 projetos</span>
                      </div>
                    </div>

                    {/* Card 4 - Eficiência */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-amber-600">Eficiência</p>
                          <h3 className="text-3xl font-bold text-gray-900 mt-2">94%</h3>
                        </div>
                        <div className="bg-amber-100 p-3 rounded-lg">
                          <Activity className="h-6 w-6 text-amber-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm text-amber-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>5% acima da meta</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Projetos Recentes e Power BI */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Projetos Recentes */}
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Projetos Recentes</h3>
                      <button className="text-sm text-primary hover:text-primary/80 font-medium">
                        Ver todos
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="h-6 w-6 text-gray-400 animate-spin mr-2" />
                          <span className="text-gray-500">Carregando projetos...</span>
                        </div>
                      ) : programs.length === 0 ? (
                        <div className="text-center py-8">
                          <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto encontrado</h3>
                          <p className="text-gray-500">Não há projetos disponíveis no momento.</p>
                        </div>
                      ) : (
                        programs.slice(0, 5).map((program) => (
                          <div 
                            key={program._id || program.id}
                            className="flex items-center p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-all border border-gray-100"
                            onClick={() => {
                              setSelectedProgram(program);
                              setActiveTab('projects');
                            }}
                          >
                            <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Factory className="h-6 w-6 text-gray-500" />
                            </div>
                            
                            <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-900">{program.name}</h4>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  program.operations.every(op => op.completed)
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {program.operations.every(op => op.completed) 
                                    ? 'Concluído'
                                    : 'Em andamento'}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <span className="mr-2">Máquina: {program.machine}</span>
                                <span>•</span>
                                <span className="ml-2">{formatDate(program.date)}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Power BI Dashboard */}
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Análise em Tempo Real</h3>
                        <p className="text-sm text-gray-500 mt-1">Métricas e indicadores</p>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Maximize2 className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                    
                    <div className="powerbi-container rounded-xl overflow-hidden border border-gray-200">
                      <iframe 
                        title="Dashboard Simoldes"
                        src="https://app.powerbi.com/view?r=eyJrIjoiMzdlYmM0NDctMzdjNi00YmZkLWE0NTQtMjc3MDg3OGYzNmMzIiwidCI6ImU5YzgwMThiLTQwY2YtNDE5MC1hOTA3LTI1ZjNjZjMyNzdiMiJ9"
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>

                {/* Seção de Atividades Recentes */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
                      <p className="text-sm text-gray-500 mt-1">Últimas 24 horas</p>
                    </div>
                  </div>

                  <div className="flow-root">
                    <ul role="list" className="-mb-8">
                      {[1,2,3,4].map((activity, index) => (
                        <li key={index}>
                          <div className="relative pb-8">
                            {index !== 3 && (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            )}
                            <div className="relative flex space-x-3">
                              <div className="relative">
                                <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                                  <Tool className="h-4 w-4 text-blue-600" />
                                </span>
                              </div>
                              <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Operação <span className="font-medium text-gray-900">Fresagem CNC</span> iniciada por{' '}
                                    <span className="font-medium text-gray-900">João Silva</span>
                                  </p>
                                </div>
                                <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                  <time dateTime="2023-01-23T13:23">há 3h</time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div>
                {!selectedProgram ? (
                  <div className="p-4 md:p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Projetos
                      </h2>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleRefresh('projects')} 
                          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg shadow-sm hover:shadow transition-all"
                        >
                          <RefreshCw className={refreshIconClass} />
                          <span>Atualizar</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {isLoading ? (
                        <div className="col-span-full flex items-center justify-center py-12">
                          <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mr-3" />
                          <span className="text-gray-500 text-lg">Carregando projetos...</span>
                        </div>
                      ) : programs.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                          <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum projeto encontrado</h3>
                          <p className="text-gray-500">Não há projetos disponíveis no momento.</p>
                        </div>
                      ) : (
                        programs.map((program) => (
                          <div
                            key={program._id || program.id}
                            onClick={() => {
                              setSelectedOperation(null);
                              setSelectedProgram(program);
                            }}
                            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-[#04514B] overflow-hidden project-card"
                          >
                            {/* Imagem do programa */}
                            <div className="relative h-48">
                              <img
                                src={program.imageUrl || IMAGES.programCapa}
                                alt={program.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="text-lg font-semibold text-white mb-1">
                                  {program.name}
                                </h3>
                                <p className="text-sm text-white/90 flex items-center">
                                  <Factory className="h-4 w-4 mr-1" />
                                  Máquina: {program.machine}
                                </p>
                              </div>
                            </div>

                            {/* Informações do programa */}
                            <div className="p-4">
                              <div className="flex flex-col space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500">Programa:</span>
                                  <span className="text-sm font-medium">{program.programPath}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500">Material:</span>
                                  <span className="text-sm font-medium">{program.material}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500">Data:</span>
                                  <span className="text-sm font-medium">{formatDate(program.date)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500">Programador:</span>
                                  <span className="text-sm font-medium">{program.programmer}</span>
                                </div>
                              </div>

                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500">Status:</span>
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                    program.operations.every(op => op.completed)
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {program.operations.every(op => op.completed) 
                                      ? <><CheckCircle2 className="h-3 w-3 mr-1" />Concluído</>
                                      : <><Lock className="h-3 w-3 mr-1" />Em andamento</>
                                    }
                                  </span>
                                </div>

                                <div className="mt-2">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Progresso:</span>
                                    <span className="font-medium">
                                      {program.operations.filter(op => op.completed).length}/{program.operations.length}
                                    </span>
                                  </div>
                                  <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-[#04514B] rounded-full transition-all"
                                      style={{
                                        width: `${(program.operations.filter(op => op.completed).length / program.operations.length) * 100}%`
                                      }}
                                    />
                                  </div>
                                </div>

                                {program.observations && (
                                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                      <p className="text-sm text-yellow-700">{program.observations}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : !selectedOperation ? (
                  // Visualização do Programa
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => setSelectedProgram(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <ArrowLeft className="h-6 w-6" />
                          </button>
                          <div>
                            <h2 className="text-lg font-medium text-gray-900">
                              {selectedProgram.name}
                            </h2>
                            <p className="text-sm text-gray-500">
                              Programa: {selectedProgram.programPath}
                            </p>
                          </div>
                        </div>
                        
                        {/* Botão de atualizar */}
                        <button 
                          onClick={() => handleRefresh('projects')}
                          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg shadow-sm hover:shadow transition-all"
                        >
                          <RefreshCw className={refreshIconClass} />
                          <span>Atualizar</span>
                        </button>
                      </div>
                      
                      {/* Conteúdo do programa */}
                      <div className="space-y-6">
                        {/* Capa do programa */}
                        <div className="bg-white rounded-lg border">
                          {/* Primeira linha */}
                          <div className="grid grid-cols-3 border-b">
                            <div className="col-span-1 border-r p-2">
                              <img
                                src={IMAGES.logo}
                                alt="Logo Simoldes"
                                className="w-full h-20 object-contain"
                              />
                            </div>
                            <div className="col-span-1 border-r p-2 flex flex-col justify-center items-center">
                              <div className="text-xs text-gray-500">Máquina:</div>
                              <div className="font-bold text-base text-blue-600">{selectedProgram.machine}</div>
                            </div>
                            <div className="col-span-1 p-2 flex flex-col justify-center items-center">
                              <div className="text-xs text-gray-500">Data:</div>
                              <div className="font-bold text-sm">{formatDate(selectedProgram.date)}</div>
                            </div>
                          </div>

                          {/* Segunda linha */}
                          <div className="border-b p-2 text-center">
                            <div className="text-xs text-gray-500">Pasta dos Programas:</div>
                            <div className="font-bold text-sm text-red-600">{selectedProgram.programPath}</div>
                          </div>

                          {/* Terceira linha */}
                          <div className="grid grid-cols-3 border-b">
                            <div className="p-2 border-r text-center">
                              <div className="text-xs text-gray-500">Programador:</div>
                              <div className="font-medium text-sm">{selectedProgram.programmer}</div>
                            </div>
                            <div className="p-2 border-r text-center">
                              <div className="text-xs text-gray-500">Status:</div>
                              <div className="font-bold text-sm text-green-600">1º ABERTO</div>
                            </div>
                            <div className="p-2 text-center">
                              <div className="text-xs text-gray-500">Material:</div>
                              <div className="font-bold text-sm text-red-600">{selectedProgram.material}</div>
                            </div>
                          </div>

                          {/* Imagem central */}
                          <div className="p-4 flex justify-center">
                            <img
                              src={selectedProgram.imageUrl}
                              alt="Visualização do programa"
                              className="max-h-96 w-full object-contain"
                            />
                          </div>

                          {/* Última linha */}
                          <div className="grid grid-cols-2 border-t">
                            <div className="p-2 border-r text-center">
                              <div className="text-xs text-gray-500">Centro do Bloco:</div>
                              <div className="font-medium text-sm">{selectedProgram.blockCenter}</div>
                            </div>
                            <div className="p-2 text-center">
                              <div className="text-xs text-gray-500">Referência:</div>
                              <div className="font-medium text-sm">{selectedProgram.reference}</div>
                            </div>
                          </div>

                          {/* Observação */}
                          <div className="p-2 border-t text-center">
                            <div className="text-xs text-gray-500">Observação:</div>
                            <div className="font-bold text-sm text-red-600">{selectedProgram.observations}</div>
                          </div>
                        </div>

                        {/* Lista de operações */}
                        <div className="bg-white shadow rounded-lg p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Operações
                          </h3>
                          <div className="space-y-6">
                            {/* Operação atual - Visualização expandida */}
                            {selectedProgram.operations.map((operation, index) => {
                              const isExpanded = expandedOperations.includes(operation.id);
                              
                              // Determine a classe de fundo apenas com base no status de conclusão
                              const bgColorClass = operation.completed 
                                ? 'bg-gray-50' 
                                : 'bg-yellow-50';
                              
                              return (
                                <div key={operation.id} className={`${bgColorClass} border border-gray-200 rounded-lg shadow mb-4`}>
                                  {/* Cabeçalho da operação com botão para expandir/recolher */}
                                  <div className="p-4 flex justify-between items-center border-b border-gray-200">
                                    <div>
                                      <h4 className="text-lg font-medium text-gray-900">
                                        Operação {operation.sequence} - {operation.type}
                                      </h4>
                                      <p className="text-sm text-gray-500">{operation.function}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {operation.completed && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Concluído
                                        </span>
                                      )}
                                      <button 
                                        onClick={() => toggleOperationExpand(operation.id)}
                                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                      >
                                        {isExpanded ? 'Recolher' : 'Expandir'}
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {/* Conteúdo expandido */}
                                  {isExpanded && (
                                    <div className="p-4">
                                      {/* Grid responsivo */}
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                                        {/* Coluna da esquerda */}
                                        <div className="space-y-4">
                                          {/* Parâmetros */}
                                          <div className="overflow-x-auto">
                                            <h5 className="text-sm font-medium text-gray-700 mb-2">Parâmetros</h5>
                                            <dl className="divide-y divide-gray-200">
                                              <div className="grid grid-cols-2 py-1">
                                                <dt className="text-gray-500">Ferramenta:</dt>
                                                <dd className="text-gray-900">{operation.toolRef}</dd>
                                              </div>
                                              <div className="grid grid-cols-2 py-1">
                                                <dt className="text-gray-500">Ponto Central:</dt>
                                                <dd className="text-gray-900">{operation.centerPoint}</dd>
                                              </div>
                                              <div className="grid grid-cols-2 py-1">
                                                <dt className="text-gray-500">IC:</dt>
                                                <dd className="text-gray-900">{operation.ic}</dd>
                                              </div>
                                              <div className="grid grid-cols-2 py-1">
                                                <dt className="text-gray-500">ALT:</dt>
                                                <dd className="text-gray-900">{operation.alt}</dd>
                                              </div>
                                            </dl>
                                          </div>

                                          {/* Detalhes */}
                                          <div>
                                            <h5 className="text-sm font-medium text-gray-700 mb-2">Detalhes</h5>
                                            <dl className="divide-y divide-gray-200">
                                              <div className="grid grid-cols-2 py-1">
                                                <dt className="text-gray-500">Profundidade:</dt>
                                                <dd className="text-gray-900">{operation.details.depth}</dd>
                                              </div>
                                              <div className="grid grid-cols-2 py-1">
                                                <dt className="text-gray-500">Velocidade:</dt>
                                                <dd className="text-gray-900">{operation.details.speed}</dd>
                                              </div>
                                              <div className="grid grid-cols-2 py-1">
                                                <dt className="text-gray-500">Avanço:</dt>
                                                <dd className="text-gray-900">{operation.details.feed}</dd>
                                              </div>
                                              <div className="grid grid-cols-2 py-1">
                                                <dt className="text-gray-500">Refrigeração:</dt>
                                                <dd className="text-gray-900">{operation.details.coolant}</dd>
                                              </div>
                                              {operation.details.notes && (
                                                <div className="grid grid-cols-2 py-1">
                                                  <dt className="text-gray-500">Notas:</dt>
                                                  <dd className="text-gray-900">{operation.details.notes}</dd>
                                                </div>
                                              )}
                                            </dl>
                                          </div>

                                          {/* Qualidade */}
                                          <div>
                                            <h5 className="text-sm font-medium text-gray-700 mb-2">Qualidade</h5>
                                            <dl className="divide-y divide-gray-200">
                                              <div className="grid grid-cols-2 py-1">
                                                <dt className="text-gray-500">Tolerância:</dt>
                                                <dd className="text-gray-900">{operation.quality.tolerance}</dd>
                                              </div>
                                              <div className="grid grid-cols-2 py-1">
                                                <dt className="text-gray-500">Acabamento:</dt>
                                                <dd className="text-gray-900">{operation.quality.surfaceFinish}</dd>
                                              </div>
                                            </dl>
                                          </div>
                                          
                                          {/* Botão de assinar (movido para a parte inferior esquerda) */}
                                          {!operation.completed && (
                                            <div className="mt-4">
                                              <button
                                                onClick={() => handleOperationCheck(operation.id)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                              >
                                                <CheckCircle2 className="h-5 w-5 mr-2" />
                                                Assinar Operação
                                              </button>
                                            </div>
                                          )}
                                        </div>

                                        {/* Coluna da direita */}
                                        <div className="space-y-4">
                                          {/* Status da operação */}
                                          {operation.completed && (
                                            <div className="bg-green-50 p-3 rounded-lg">
                                              <h5 className="text-sm font-medium text-gray-700 mb-2">Detalhes da Conclusão</h5>
                                              <dl className="divide-y divide-gray-200">
                                                <div className="grid grid-cols-2 py-1">
                                                  <dt className="text-gray-500">Assinado por:</dt>
                                                  <dd className="text-gray-900">{operation.signedBy}</dd>
                                                </div>
                                                <div className="grid grid-cols-2 py-1">
                                                  <dt className="text-gray-500">Data/Hora:</dt>
                                                  <dd className="text-gray-900">{operation.timestamp}</dd>
                                                </div>
                                                {operation.timeRecord && (
                                                  <>
                                                    <div className="grid grid-cols-2 py-1">
                                                      <dt className="text-gray-500">Início:</dt>
                                                      <dd className="text-gray-900">{operation.timeRecord.start}</dd>
                                                    </div>
                                                    <div className="grid grid-cols-2 py-1">
                                                      <dt className="text-gray-500">Término:</dt>
                                                      <dd className="text-gray-900">{operation.timeRecord.end}</dd>
                                                    </div>
                                                  </>
                                                )}
                                                {operation.measurementValue && (
                                                  <div className="grid grid-cols-2 py-1">
                                                    <dt className="text-gray-500">Medição:</dt>
                                                    <dd className="text-gray-900">{operation.measurementValue} mm</dd>
                                                  </div>
                                                )}
                                              </dl>
                                            </div>
                                          )}

                                          {/* Botão de visualizar */}
                                          <div className="flex justify-end">
                                            <button
                                              onClick={() => setSelectedOperation(operation)}
                                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                                            >
                                              <Eye className="h-4 w-4 mr-2" />
                                              Visualizar Detalhes
                                            </button>
                                          </div>

                                          {/* Visualização 2D */}
                                          <div className={`${operation.completed ? 'bg-gray-50' : 'bg-yellow-50'} p-3 rounded-lg`}>
                                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                                              Visualização 2D
                                            </h5>
                                            <div className="relative w-full h-0 pb-[75%] rounded overflow-hidden">
                                              <div className="absolute inset-0 flex items-center justify-center p-4">
                                                <img
                                                  src={IMAGES.operation2d}
                                                  alt="Visualização da operação"
                                                  className="max-w-[80%] max-h-[80%] object-contain"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            
                            {/* Tabela com outras operações - REMOVIDA */}
                          </div>
                        </div>

                        {/* Export and Finish Project Buttons */}
                        <div className="mt-6 flex justify-end space-x-4">
                          {!selectedProgram.status || selectedProgram.status !== 'completed' ? (
                            <button
                              onClick={() => handleFinishProject(selectedProgram.projectId || selectedProgram.id || '')}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                              <CheckCircle2 className="h-5 w-5 mr-2" />
                              Finalizar Projeto
                            </button>
                          ) : (
                            <div className="inline-flex items-center px-4 py-2 text-sm text-green-700 bg-green-50 rounded-md">
                              <CheckCircle2 className="h-5 w-5 mr-2" />
                              Finalizado em {formatDate(selectedProgram.completedDate)}
                            </div>
                          )}
                          <button
                            onClick={() => {
                              const projectId = selectedProgram.projectId || selectedProgram.id;
                              if (projectId) {
                                handleExportLogs(projectId);
                              }
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#04514B] hover:bg-[#034038] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#04514B] transition-colors"
                          >
                            <FileSpreadsheet className="h-5 w-5 mr-2" />
                            Exportar Logs em Excel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Visualização da Operação
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center space-x-4 mb-6">
                        <button
                          onClick={() => setSelectedOperation(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div>
                          <h2 className="text-lg font-medium text-gray-900">
                            Operação {selectedOperation.sequence} - {selectedOperation.type}
                          </h2>
                          <p className="text-sm text-gray-500">
                            {selectedOperation.function}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">
                              Detalhes da Operação
                            </h3>
                            <dl className="grid grid-cols-2 gap-2 text-sm">
                              <dt className="text-gray-500">Ferramenta:</dt>
                              <dd className="text-gray-900">{selectedOperation.toolRef}</dd>
                              <dt className="text-gray-500">Velocidade:</dt>
                              <dd className="text-gray-900">{selectedOperation.details.speed}</dd>
                              <dt className="text-gray-500">Avanço:</dt>
                              <dd className="text-gray-900">{selectedOperation.details.feed}</dd>
                              <dt className="text-gray-500">Profundidade:</dt>
                              <dd className="text-gray-900">{selectedOperation.details.depth}</dd>
                              <dt className="text-gray-500">Tolerância:</dt>
                              <dd className="text-gray-900">{selectedOperation.quality.tolerance}</dd>
                              <dt className="text-gray-500">Acabamento:</dt>
                              <dd className="text-gray-900">{selectedOperation.quality.surfaceFinish}</dd>
                              <dt className="text-gray-500">Operador:</dt>
                              <dd className="text-gray-900">{selectedOperation.signedBy}</dd>
                              <dt className="text-gray-500">Medição:</dt>
                              <dd className="text-gray-900">{selectedOperation.measurementValue}mm</dd>
                            </dl>
                          </div>

                          {selectedOperation.details.notes && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <Info className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div className="ml-3">
                                  <h3 className="text-sm font-medium text-yellow-800">
                                    Observações
                                  </h3>
                                  <p className="text-sm text-yellow-700 mt-1">
                                    {selectedOperation.details.notes}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-900 mb-2">
                            Visualização da Operação
                          </h3>
                          <div className="aspect-w-16 aspect-h-9">
                            <img
                              src={selectedProgram.imageUrl || IMAGES.programCapa}
                              alt="Visualização da operação"
                              className="w-full h-full object-contain rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                {!selectedProgram ? (
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Histórico de Projetos
                      </h2>
                      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <select 
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#04514B]"
                          defaultValue="all"
                        >
                          <option value="all">Todos os Status</option>
                          <option value="completed">Concluídos</option>
                          <option value="cancelled">Cancelados</option>
                        </select>
                        <select 
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#04514B]"
                          defaultValue="30"
                        >
                          <option value="7">Últimos 7 dias</option>
                          <option value="30">Últimos 30 dias</option>
                          <option value="90">Últimos 90 dias</option>
                          <option value="all">Todo período</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {historicPrograms.map((program) => (
                        <div
                          key={program.id}
                          onClick={() => {
                            setSelectedOperation(null);
                            setSelectedProgram(program);
                          }}
                          className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-[#04514B] overflow-hidden"
                        >
                          {/* Imagem do programa */}
                          <div className="relative h-48">
                            <img
                              src={program.imageUrl || IMAGES.programCapa}
                              alt={program.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {program.name}
                              </h3>
                              <p className="text-sm text-white/90 flex items-center">
                                <Factory className="h-4 w-4 mr-1" />
                                Máquina: {program.machine}
                              </p>
                            </div>
                          </div>

                          {/* Informações do programa */}
                          <div className="p-4">
                            <div className="flex flex-col space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Data:</span>
                                <span className="text-sm font-medium">{formatDate(program.date)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Programador:</span>
                                <span className="text-sm font-medium">{program.programmer}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Material:</span>
                                <span className="text-sm font-medium">{program.material}</span>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Status:</span>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                  program.operations.every(op => op.completed)
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {program.operations.every(op => op.completed) 
                                    ? <><CheckCircle2 className="h-3 w-3 mr-1" />Concluído</>
                                    : <><AlertTriangle className="h-3 w-3 mr-1" />Em andamento</>
                                  }
                                </span>
                              </div>
                              <div className="mt-2">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-500">Operações:</span>
                                  <span className="font-medium">
                                    {program.operations.filter(op => op.completed).length}/{program.operations.length}
                                  </span>
                                </div>
                                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-[#04514B] rounded-full transition-all"
                                    style={{
                                      width: `${(program.operations.filter(op => op.completed).length / program.operations.length) * 100}%`
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : !selectedOperation ? (
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-3 sm:p-4">
                      {/* Cabeçalho com botão voltar */}
                      <div className="flex items-center space-x-4 mb-4">
                        <button
                          onClick={() => setSelectedProgram(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h2 className="text-base font-medium text-gray-900">
                          FOLHA DE PROCESSOS
                        </h2>
                      </div>

                      {/* Nova estrutura com grid */}
                      <div className="bg-white rounded-lg border mb-4">
                        {/* Primeira linha */}
                        <div className="grid grid-cols-3 border-b">
                          <div className="col-span-1 border-r p-2">
                            <img
                              src={IMAGES.logo}
                              alt="Logo Simoldes"
                              className="w-full h-20 object-contain"
                            />
                          </div>
                          <div className="col-span-1 border-r p-2 flex flex-col justify-center items-center">
                            <div className="text-xs text-gray-500">Máquina:</div>
                            <div className="font-bold text-base text-blue-600">{selectedProgram.machine}</div>
                          </div>
                          <div className="col-span-1 p-2 flex flex-col justify-center items-center">
                            <div className="text-xs text-gray-500">Data:</div>
                            <div className="font-bold text-sm">{formatDate(selectedProgram.date)}</div>
                          </div>
                        </div>

                        {/* Imagem central */}
                        <div className="p-4 flex justify-center">
                          <img
                            src={selectedProgram.imageUrl}
                            alt="Visualização do programa"
                            className="max-h-96 w-full object-contain"
                          />
                        </div>

                        {/* Última linha */}
                        <div className="grid grid-cols-2 border-t">
                          <div className="p-2 border-r text-center">
                            <div className="text-xs text-gray-500">Status:</div>
                            <div className="font-bold text-sm text-green-600">1º ABERTO</div>
                          </div>
                          <div className="p-2 text-center">
                            <div className="text-xs text-gray-500">Material:</div>
                            <div className="font-bold text-sm text-red-600">{selectedProgram.material}</div>
                          </div>
                        </div>

                        {/* Última linha com informações do bloco */}
                        <div className="grid grid-cols-2 border-t">
                          <div className="p-2 border-r text-center">
                            <div className="text-xs text-gray-500">Centro do Bloco:</div>
                            <div className="font-medium text-sm">{selectedProgram.blockCenter}</div>
                          </div>
                          <div className="p-2 text-center">
                            <div className="text-xs text-gray-500">Referência:</div>
                            <div className="font-medium text-sm">{selectedProgram.reference}</div>
                          </div>
                        </div>

                        {/* Observação */}
                        <div className="p-2 border-t text-center">
                          <div className="text-xs text-gray-500">Observação:</div>
                          <div className="font-bold text-sm text-red-600">{selectedProgram.observations}</div>
                        </div>
                      </div>

                      {/* Tabela de operações */}
                      <div className="mt-8">
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seq.</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ferramenta</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parâmetros</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualidade</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operador</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medição</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedProgram.operations.map((operation) => (
                                <tr key={operation.id} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{operation.sequence}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{operation.type}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{operation.function}</td>
                                  <td className="px-3 py-2 text-sm text-gray-500">
                                    <div className="max-w-xs truncate">{operation.toolRef}</div>
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-900">
                                    <div className="space-y-1">
                                      <div>Vel: {operation.details.speed}</div>
                                      <div>Av: {operation.details.feed}</div>
                                      <div>Prof: {operation.details.depth}</div>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-900">
                                    <div>Tol: {operation.quality.tolerance}</div>
                                    <div>Acab: {operation.quality.surfaceFinish}</div>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{operation.signedBy}</td>
                                  <td className="px-3 py-2 text-sm text-gray-900">
                                    <div>Início: {operation.timeRecord?.start}</div>
                                    <div>Fim: {operation.timeRecord?.end}</div>
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-900">{operation.measurementValue}mm</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                    <OperationActions
                                      operationId={operation.id}
                                      completed={operation.completed}
                                      onView={() => setSelectedOperation(operation)}
                                      onSign={() => {}}
                                      isHistory={true}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Visualização detalhada da operação
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center space-x-4 mb-6">
                        <button
                          onClick={() => setSelectedOperation(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div>
                          <h2 className="text-lg font-medium text-gray-900">
                            Operação {selectedOperation.sequence} - {selectedOperation.type}
                          </h2>
                          <p className="text-sm text-gray-500">
                            {selectedOperation.function}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">
                              Detalhes da Operação
                            </h3>
                            <dl className="grid grid-cols-2 gap-2 text-sm">
                              <dt className="text-gray-500">Ferramenta:</dt>
                              <dd className="text-gray-900">{selectedOperation.toolRef}</dd>
                              <dt className="text-gray-500">Velocidade:</dt>
                              <dd className="text-gray-900">{selectedOperation.details.speed}</dd>
                              <dt className="text-gray-500">Avanço:</dt>
                              <dd className="text-gray-900">{selectedOperation.details.feed}</dd>
                              <dt className="text-gray-500">Profundidade:</dt>
                              <dd className="text-gray-900">{selectedOperation.details.depth}</dd>
                              <dt className="text-gray-500">Tolerância:</dt>
                              <dd className="text-gray-900">{selectedOperation.quality.tolerance}</dd>
                              <dt className="text-gray-500">Acabamento:</dt>
                              <dd className="text-gray-900">{selectedOperation.quality.surfaceFinish}</dd>
                              <dt className="text-gray-500">Operador:</dt>
                              <dd className="text-gray-900">{selectedOperation.signedBy}</dd>
                              <dt className="text-gray-500">Medição:</dt>
                              <dd className="text-gray-900">{selectedOperation.measurementValue}mm</dd>
                            </dl>
                          </div>

                          {selectedOperation.details.notes && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <Info className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div className="ml-3">
                                  <h3 className="text-sm font-medium text-yellow-800">
                                    Observações
                                  </h3>
                                  <p className="text-sm text-yellow-700 mt-1">
                                    {selectedOperation.details.notes}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-900 mb-2">
                            Visualização da Operação
                          </h3>
                          <div className="aspect-w-16 aspect-h-9">
                            <img
                              src={selectedProgram.imageUrl || IMAGES.programCapa}
                              alt="Visualização da operação"
                              className="w-full h-full object-contain rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Adicionando a renderização do painel de administração */}
            {activeTab === 'admin' && (
              <AdminPanel />
            )}
          </main>
        </div>
      </div>
      <OperatorSearchModal
        isOpen={signModal.isOpen}
        onClose={() => setSignModal({ isOpen: false, operationId: null })}
        onSelect={(operator) => {
          handleSignConfirm({
            startTime: '',
            endTime: '',
            measurement: '',
            operatorName: operator.name,
            notes: ''
          });
        }}
      />
    </>
  );
}

export default App;

























