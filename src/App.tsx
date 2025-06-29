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
import { getProjectsWithOperations, getProjectWithOperationsById, finishProject } from './services/projectService';
import { signOperation } from './services/operationService';
import { createLog } from './services/logService';
import { AdminPanel } from './components/AdminPanel'; // Importando o componente AdminPanel
import { OperationCard } from './components/OperationCard';
import { PasswordSignModal } from './components/PasswordSignModal';
import type { Machine } from './services/authService';
import { authenticateOperator, Operator } from './services/operatorService';

const IMAGES = {
  logo: `${import.meta.env.BASE_URL}simoldeslogo.png`,
  loginCapa: `${import.meta.env.BASE_URL}loginmodal.jpg`,
  programCapa: `${import.meta.env.BASE_URL}2d.png`,
  operation: `${import.meta.env.BASE_URL}2d.png`,
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
  status?: 'in_progress' | 'completed' | 'cancelled';
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

// Definir a constante PROCESS_FIELDS no topo do arquivo (se ainda não existir)
const PROCESS_FIELDS = [
  { key: 'Programa', label: 'Programa' },
  { key: 'Tipo Percurso', label: 'Tipo Percurso' },
  { key: 'Ref.', label: 'Ref.' },
  { key: 'Comentário', label: 'Comentário' },
  { key: 'Ø RC', label: 'Ø RC' },
  { key: 'Ferramenta', label: 'Ferramenta' },
  { key: 'Rib.', label: 'Rib.' },
  { key: 'Alt.', label: 'Alt.' },
  { key: 'Z min', label: 'Z min' },
  { key: 'Lat.2D', label: 'Lat.2D' },
  { key: 'Sob. Esp.', label: 'Sob. Esp.' },
  { key: 'Passo Lat.', label: 'Passo Lat.' },
  { key: 'Passo Vert.', label: 'Passo Vert.' },
  { key: 'Tol.', label: 'Tol.' },
  { key: 'Rot.', label: 'Rot.' },
  { key: 'Av.', label: 'Av.' },
  { key: 'Ângulo', label: 'Ângulo' },
  { key: 'Plano Trab.', label: 'Plano Trab.' },
  { key: 'Tempo Corte', label: 'Tempo Corte' },
  { key: 'Tempo Total', label: 'Tempo Total' },
  { key: 'Medição', label: 'Medição' },
  { key: 'Rubrica', label: 'Rubrica' },
  { key: 'Fresa', label: 'Fresa' },
  { key: 'Sup.', label: 'Sup.' },
];

function App() {
  const [machineId, setMachineId] = useState(''); // Alterado de operatorId para machineId
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProgram, setSelectedProgram] = useState<MoldProgram | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedOperations, setExpandedOperations] = useState<number[]>([]);
  const [programs, setPrograms] = useState<MoldProgram[]>([]); // Inicializar vazio
  const [isLoading, setIsLoading] = useState(true);
  // Adicionar estado para guardar dados da máquina autenticada
  const [authenticatedMachine, setAuthenticatedMachine] = useState<Machine | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [operatorLoginModal, setOperatorLoginModal] = useState(false);
  const [operatorCode, setOperatorCode] = useState('');
  const [operatorPassword, setOperatorPassword] = useState('');
  // Adicionar estado para o filtro de status
  const [historyStatus, setHistoryStatus] = useState<string>('all');
  // 1. Adicione estados locais para os campos de assinatura na visualização detalhada da operação
  const [signOperator, setSignOperator] = useState('');
  const [signStartTime, setSignStartTime] = useState('');
  const [signEndTime, setSignEndTime] = useState('');
  const [signMeasurement, setSignMeasurement] = useState('');
  const [signNotes, setSignNotes] = useState('');

  // Carregar dados do banco de dados
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setIsLoading(true);
        // Usar o machineId da máquina autenticada se disponível
        const currentMachineId = authenticatedMachine?.machineId || machineId;
        console.log('[DEBUG] loadPrograms usando machineId:', currentMachineId);
        
        const projectsData = await getProjectsWithOperations(currentMachineId);
        
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
          operations: ((project as any).operations || []).map((op: any, index: number) => ({
            ...op,
            id: op.id || index + 1, // Garantir que cada operação tenha um ID único
            imageUrl: op.imageUrl || IMAGES.operation, // Usar imagem padrão se não existir
            completed: op.completed || false, // Garantir que completed seja boolean
            signedBy: op.signedBy || undefined,
            timestamp: op.timestamp || undefined,
            inspectionNotes: op.inspectionNotes || undefined,
            timeRecord: op.timeRecord || undefined,
            measurementValue: op.measurementValue || undefined
          }))
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

    if (isAuthenticated && (authenticatedMachine?.machineId || machineId)) {
      loadPrograms();
    }
  }, [isAuthenticated, machineId, authenticatedMachine]);

  const toggleOperationExpand = (operationId: number | undefined) => {
    if (operationId === undefined) return;
    
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
          setAuthenticatedMachine(machine); // Salva a máquina autenticada
          setActiveTab('projects'); // Ir direto para a página de projetos
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
    setAuthenticatedMachine(null);
    setMachineId('');
    setPassword('');
    setActiveTab('projects'); // Volta para a aba padrão
    setSelectedProgram(null);
    setSelectedOperation(null);
    setOperator(null); // Remove operador/admin
    setOperatorLoginModal(false);
    setExpandedOperations([]);
  };

  const handleOperationCheck = (operationId: number | undefined) => {
    console.log('[DEBUG] handleOperationCheck chamado para operationId:', operationId);
    
    // Verificar se o operationId é válido
    if (operationId === undefined || operationId === null) {
      console.error('[DEBUG] operationId inválido:', operationId);
      return;
    }
    
    console.log('[DEBUG] Modal deve abrir agora com operationId:', operationId);
  };

  const handleSignConfirm = async (data: { operatorName: string; startTime: string; endTime: string; measurement: string; notes?: string; }) => {
    if (!selectedProgram) return;
    await signOperation({
      projectId: String(selectedProgram.projectId || selectedProgram.id),
      operationId: selectedOperation?.id || 0,
      ...data
    });
    await handleRefreshSelectedProject();
  };

  // Função para atualizar o projeto selecionado a partir da API
  const handleRefreshSelectedProject = async () => {
    if (!selectedProgram) {
      console.log('[DEBUG] handleRefreshSelectedProject: selectedProgram é null');
      return;
    }
    console.log('[DEBUG] handleRefreshSelectedProject chamado para projeto:', selectedProgram.projectId || selectedProgram.id);
    console.log('[DEBUG] selectedProgram completo:', selectedProgram);
    setIsRefreshing(true);
    try {
      const projectId = String(selectedProgram.projectId || selectedProgram.id);
      console.log('[DEBUG] Chamando API com projectId:', projectId);
      
      const updated = await getProjectWithOperationsById(projectId);
      console.log('[DEBUG] Projeto atualizado recebido da API:', updated);
      
      if (!updated) {
        console.error('[DEBUG] API retornou null/undefined');
        alert('Erro: Projeto não encontrado na API');
        return;
      }
      
      const safeUpdated = updated as any;
      console.log('[DEBUG] Convertendo dados do projeto...');
      
      const updatedProject = {
        ...safeUpdated,
        programPath: safeUpdated.programPath || '',
        material: safeUpdated.material || '',
        date: safeUpdated.date,
        programmer: safeUpdated.programmer || '',
        blockCenter: safeUpdated.blockCenter || '',
        reference: safeUpdated.reference || '',
        observations: safeUpdated.observations || '',
        imageUrl: safeUpdated.imageUrl || IMAGES.programCapa,
        status: safeUpdated.status,
        completedDate: safeUpdated.completedDate,
        operations: (safeUpdated.operations || []).map((op: any, index: number) => ({
          ...op,
          id: op.id || index + 1,
          imageUrl: op.imageUrl || IMAGES.operation,
          completed: op.completed || false,
          signedBy: op.signedBy || undefined,
          timestamp: op.timestamp || undefined,
          inspectionNotes: op.inspectionNotes || undefined,
          timeRecord: op.timeRecord || undefined,
          measurementValue: op.measurementValue || undefined
        }))
      };
      
      console.log('[DEBUG] Projeto convertido:', updatedProject);
      setSelectedProgram(updatedProject);
      console.log('[DEBUG] Estado selectedProgram atualizado');
      
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      alert('Erro ao atualizar projeto. Verifique o console para mais detalhes.');
    } finally {
      setIsRefreshing(false);
      console.log('[DEBUG] handleRefreshSelectedProject finalizado');
    }
  };

  // Função para atualizar todos os projetos
  const handleRefresh = async (tab: string) => {
    console.log('[DEBUG] handleRefresh chamado com tab:', tab, 'machineId:', machineId);
    console.log('[DEBUG] Estado atual de programs:', programs.length, 'projetos');
    console.log('[DEBUG] authenticatedMachine:', authenticatedMachine);
    
    // Usar o machineId da máquina autenticada se disponível
    const currentMachineId = authenticatedMachine?.machineId || machineId;
    console.log('[DEBUG] Usando machineId:', currentMachineId);
    
    setIsRefreshing(true);
    try {
      if (tab === 'dashboard' || tab === 'projects' || tab === 'history') {
        console.log('[DEBUG] Buscando projetos da API para máquina:', currentMachineId);
        const projectsData = await getProjectsWithOperations(currentMachineId);
        console.log('[DEBUG] Dados recebidos da API:', projectsData.length, 'projetos');
        console.log('[DEBUG] Primeiro projeto:', projectsData[0]);
        
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
        
        console.log('[DEBUG] Projetos convertidos:', convertedPrograms.length);
        console.log('[DEBUG] Primeiro projeto convertido:', convertedPrograms[0]);
        setPrograms(convertedPrograms);
        console.log('[DEBUG] Estado programs atualizado');
      }
    } catch (error) {
      console.error('Erro ao recarregar projetos:', error);
      alert('Erro ao atualizar dados. Verifique o console para mais detalhes.');
    } finally {
      setIsRefreshing(false);
      console.log('[DEBUG] Refresh finalizado');
    }
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

  const handleFinishProject = async (projectId: string) => {
    if (!selectedProgram) return;
    
    // Verificar se todas as operações estão completadas
    const incompleteOperations = selectedProgram.operations.filter(op => !op.completed);
    if (incompleteOperations.length > 0) {
      const operationList = incompleteOperations.map(op => 
        `- Operação ${op.sequence}: ${op.type} (${op.function})`
      ).join('\n');
      
      alert(`Não é possível finalizar o projeto. Existem operações pendentes:\n\n${operationList}`);
      return;
    }
    
    try {
      console.log('Finalizando projeto:', projectId);
      
      const result = await finishProject(projectId);
      
      if (result.success) {
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
        console.log('Projeto finalizado:', result);
      } else {
        alert('Erro ao finalizar projeto: ' + result.message);
      }
    } catch (error: any) {
      console.error('Erro ao finalizar projeto:', error);
      
      if (error.message && error.message.includes('operações pendentes')) {
        alert('Erro: ' + error.message);
      } else {
        alert('Erro ao finalizar projeto. Tente novamente.');
      }
    }
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

  // Função de login de operador/admin
  const handleOperatorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Tentando login de operador:', { operatorCode, operatorPassword: '***' });
    
    try {
      const op = await authenticateOperator(operatorCode, operatorPassword);
      if (op) {
        console.log('Login de operador bem-sucedido:', op.name, 'Role:', op.role);
        setOperator(op);
        setOperatorLoginModal(false);
        setOperatorCode('');
        setOperatorPassword('');
        
        // Se o operador tem role admin, permitir acesso à aba de administração
        if (op.role === 'admin') {
          setActiveTab('admin');
          setSelectedProgram(null);
          setSelectedOperation(null);
        }
      } else {
        console.log('Login de operador falhou');
        alert('Usuário ou senha inválidos!');
      }
    } catch (error) {
      console.error('Erro no login de operador:', error);
      alert('Erro ao fazer login. Tente novamente.');
    }
  };

  const handleOperatorLogout = () => {
    setOperator(null);
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
        <header className="bg-gradient-to-r from-[#04514B] to-[#0d4741] shadow-lg h-20 flex items-center w-full">
          <div className="w-full flex items-center justify-between h-full relative">
            {/* Logo totalmente à esquerda */}
            <div className="flex items-center h-full pl-6">
              <img src={IMAGES.logo} alt="Simoldes Logo" className="h-12 w-auto" />
            </div>
            {/* Título centralizado absoluto */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full flex justify-center pointer-events-none select-none">
              <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-white text-center drop-shadow-lg whitespace-nowrap">
                Sistema de Controle
              </h1>
            </div>
            {/* Ações totalmente à direita */}
            <div className="flex items-center gap-6 h-full pr-6">
              <button className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                <Settings className="h-6 w-6" />
              </button>
              <div className="flex items-center pl-4 border-l border-white/20">
                <div className="text-right">
                  <p className="text-white text-sm font-medium leading-tight">{machineId}</p>
                  <p className="text-white/60 text-xs leading-tight">Máquina</p>
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
                if (e.target.value === 'dashboard') {
                  if (operator?.role === 'admin') {
                    setActiveTab('dashboard');
                    setSelectedProgram(null);
                  } else {
                    setOperatorLoginModal(true);
                    // Não troca a aba
                    return;
                  }
                } else if (e.target.value === 'admin') {
                  if (operator?.role === 'admin') {
                    setActiveTab('admin');
                    setSelectedProgram(null);
                  } else {
                    setOperatorLoginModal(true);
                    // Não troca a aba
                    return;
                  }
                } else {
                  setActiveTab(e.target.value);
                  setSelectedProgram(null);
                }
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
                      if (operator?.role === 'admin') {
                        setActiveTab('dashboard');
                        setSelectedProgram(null);
                        setSelectedOperation(null);
                      } else {
                        setOperatorLoginModal(true);
                        // Não troca a aba ainda
                      }
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
                      if (operator?.role === 'admin') {
                        setActiveTab('admin');
                        setSelectedProgram(null);
                        setSelectedOperation(null);
                      } else {
                        setOperatorLoginModal(true);
                        // Não troca a aba ainda
                      }
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
                          onClick={async () => {
                            setSelectedOperation(null);
                            const freshProject = await getProjectWithOperationsById(String(program.projectId || program.id));
                            const safeFreshProject = freshProject as any;
                            setSelectedProgram({
                              ...safeFreshProject,
                              programPath: safeFreshProject.programPath || '',
                              material: safeFreshProject.material || '',
                              date: safeFreshProject.date,
                              programmer: safeFreshProject.programmer || '',
                              blockCenter: safeFreshProject.blockCenter || '',
                              reference: safeFreshProject.reference || '',
                              observations: safeFreshProject.observations || '',
                              imageUrl: safeFreshProject.imageUrl || IMAGES.programCapa,
                              status: safeFreshProject.status,
                              completedDate: safeFreshProject.completedDate,
                              operations: safeFreshProject.operations || []
                            });
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
                        programs
                          .filter(program => program.status !== 'completed')
                          .map((program) => (
                        <div
                            key={program._id || program.id}
                          onClick={async () => {
                            setSelectedOperation(null);
                            const freshProject = await getProjectWithOperationsById(String(program.projectId || program.id));
                            const safeFreshProject = freshProject as any;
                            setSelectedProgram({
                              ...safeFreshProject,
                              programPath: safeFreshProject.programPath || '',
                              material: safeFreshProject.material || '',
                              date: safeFreshProject.date,
                              programmer: safeFreshProject.programmer || '',
                              blockCenter: safeFreshProject.blockCenter || '',
                              reference: safeFreshProject.reference || '',
                              observations: safeFreshProject.observations || '',
                              imageUrl: safeFreshProject.imageUrl || IMAGES.programCapa,
                              status: safeFreshProject.status,
                              completedDate: safeFreshProject.completedDate,
                              operations: safeFreshProject.operations || []
                            });
                          }}
                          className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-[#04514B] overflow-hidden project-card"
                        >
                          {/* Imagem do programa */}
                          <div className="relative h-48">
                            <img
                              src={program.imageUrl || `${import.meta.env.BASE_URL}2d.png`}
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
                                  program.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {program.status === 'completed'
                                    ? <><CheckCircle2 className="h-3 w-3 mr-1" />Concluído</>
                                    : <><AlertTriangle className="h-3 w-3 mr-1" />Em andamento</>
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
                          onClick={() => {
                            console.log('[DEBUG] Botão de atualizar clicado dentro do projeto');
                            handleRefreshSelectedProject();
                          }}
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
                              src={selectedProgram.imageUrl || `${import.meta.env.BASE_URL}2d.png`}
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
                        {selectedProgram && !selectedOperation && (
                          <section className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Operações do Projeto</h2>
                            <div className="flex flex-col gap-6">
                              {selectedProgram.operations.length === 0 && (
                                <div className="text-center text-gray-500">Nenhuma operação cadastrada para este projeto.</div>
                              )}
                              {selectedProgram.operations.map((operation, index) => (
                                <OperationCard
                                  key={`${selectedProgram.id}-${operation.id || index}`}
                                  operation={operation}
                                  expanded={expandedOperations.includes(operation.id || index)}
                                  onExpand={() => toggleOperationExpand(operation.id || index)}
                                  onSign={() => { 
                                    console.log('[DEBUG] onSign do OperationCard', operation.id || index); 
                                    console.log('[DEBUG] operation.completed:', operation.completed);
                                    console.log('[DEBUG] selectedProgram:', selectedProgram);
                                    handleOperationCheck(operation.id || index); 
                                  }}
                                  onView={() => setSelectedOperation(operation)}
                                  projectId={selectedProgram.projectId || selectedProgram.id}
                                />
                              ))}
                            </div>
                          </section>
                        )}

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
                  <div className="relative group rounded-2xl shadow-xl border-0 bg-gradient-to-br from-white via-[#f3f4f6] to-[#e6f4f1] overflow-hidden transition-transform max-w-5xl mx-auto mt-8 border-l-8" style={{ borderLeftColor: '#22c55e' }}>
                    <div className="px-6 py-8">
                      <div className="flex items-center gap-3 mb-6">
                        <button
                          onClick={() => setSelectedOperation(null)}
                          className="text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full p-2 border border-gray-200"
                          title="Voltar"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Operação #{selectedOperation?.sequence}
                          </span>
                          <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {selectedOperation?.type} <span className="text-base font-normal text-gray-500">({selectedOperation?.function})</span>
                          </span>
                          <span className="text-xs text-gray-500">
                            Ferramenta: <span className="font-semibold text-gray-700">{selectedOperation?.toolRef}</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-gray-50 p-4 rounded-lg mt-4">
                            <h3 className="text-sm font-medium text-[#04514B] mb-2">Detalhes da Operação</h3>
                            <dl className="divide-y divide-gray-100 bg-white/60 rounded-lg p-3 shadow-sm">
                              <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Ferramenta:</dt><dd className="text-gray-900 font-semibold">{selectedOperation?.toolRef}</dd></div>
                              <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Velocidade:</dt><dd className="text-gray-900 font-semibold">{selectedOperation?.details.speed}</dd></div>
                              <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Avanço:</dt><dd className="text-gray-900 font-semibold">{selectedOperation?.details.feed}</dd></div>
                              <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Profundidade:</dt><dd className="text-gray-900 font-semibold">{selectedOperation?.details.depth}</dd></div>
                              <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Tolerância:</dt><dd className="text-gray-900 font-semibold">{selectedOperation?.quality.tolerance}</dd></div>
                              <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Acabamento:</dt><dd className="text-gray-900 font-semibold">{selectedOperation?.quality.surfaceFinish}</dd></div>
                              <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Operador:</dt><dd className="text-gray-900 font-semibold">{selectedOperation?.signedBy}</dd></div>
                              <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Medição:</dt><dd className="text-gray-900 font-semibold">{selectedOperation?.measurementValue}mm</dd></div>
                            </dl>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg mt-4">
                            <h3 className="text-sm font-medium text-[#04514B] mb-2">Folha de Processo</h3>
                            <dl className="divide-y divide-gray-100 bg-white/60 rounded-lg p-3 shadow-sm">
                              {PROCESS_FIELDS.map(({ key, label }) => (
                                <div className="grid grid-cols-2 py-1" key={key}>
                                  <dt className="text-gray-500">{label}</dt>
                                  <dd className="text-gray-900 font-semibold">{(selectedOperation as any)?.[key] || '—'}</dd>
                                </div>
                              ))}
                            </dl>
                          </div>                          
                          {selectedOperation?.details.notes && (
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
                              src={selectedProgram.imageUrl || `${import.meta.env.BASE_URL}2d.png`}
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
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            console.log('[DEBUG] Botão de atualizar clicado na página de histórico');
                            handleRefresh('history');
                          }} 
                          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg shadow-sm hover:shadow transition-all"
                        >
                          <RefreshCw className={refreshIconClass} />
                          <span>Atualizar</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {programs
                        .filter(program => program.status === 'completed')
                        .map((program) => (
                          <div
                            key={program.id}
                            onClick={async () => {
                              setSelectedOperation(null);
                              console.log('[DEBUG] Selecionando projeto no histórico:', program.projectId || program.id);
                              
                              try {
                                // Buscar o projeto completo da API
                                const fullProject = await getProjectWithOperationsById(String(program.projectId || program.id));
                                console.log('[DEBUG] Projeto completo buscado da API:', fullProject);
                                
                                if (fullProject) {
                                  const safeProject = fullProject as any;
                                  const convertedProject = {
                                    ...safeProject,
                                    programPath: safeProject.programPath || '',
                                    material: safeProject.material || '',
                                    date: safeProject.date,
                                    programmer: safeProject.programmer || '',
                                    blockCenter: safeProject.blockCenter || '',
                                    reference: safeProject.reference || '',
                                    observations: safeProject.observations || '',
                                    imageUrl: safeProject.imageUrl || IMAGES.programCapa,
                                    status: safeProject.status,
                                    completedDate: safeProject.completedDate,
                                    operations: (safeProject.operations || []).map((op: any, index: number) => ({
                                      ...op,
                                      id: op.id || index + 1,
                                      imageUrl: op.imageUrl || IMAGES.operation,
                                      completed: op.completed || false,
                                      signedBy: op.signedBy || undefined,
                                      timestamp: op.timestamp || undefined,
                                      inspectionNotes: op.inspectionNotes || undefined,
                                      timeRecord: op.timeRecord || undefined,
                                      measurementValue: op.measurementValue || undefined
                                    }))
                                  };
                                  
                                  console.log('[DEBUG] Projeto convertido e definido:', convertedProject);
                                  setSelectedProgram(convertedProject);
                                } else {
                                  console.error('[DEBUG] Projeto não encontrado na API, usando dados locais');
                                  setSelectedProgram(program);
                                }
                              } catch (error) {
                                console.error('[DEBUG] Erro ao buscar projeto da API:', error);
                                console.log('[DEBUG] Usando dados locais do projeto');
                                setSelectedProgram(program);
                              }
                            }}
                            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-[#04514B] overflow-hidden"
                          >
                            {/* Imagem do programa */}
                            <div className="relative h-48">
                              <img
                                src={program.imageUrl || `${import.meta.env.BASE_URL}2d.png`}
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
                                    program.status === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {program.status === 'completed'
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
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
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
                        <button 
                          onClick={() => {
                            console.log('[DEBUG] Botão de atualizar clicado dentro do projeto do histórico');
                            if (selectedProgram) {
                              handleRefreshSelectedProject();
                            } else {
                              console.error('[DEBUG] selectedProgram é null!');
                              alert('Erro: Projeto não selecionado');
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg shadow-sm hover:shadow transition-all"
                        >
                          <RefreshCw className={refreshIconClass} />
                          <span>Atualizar</span>
                        </button>
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
                            src={selectedProgram.imageUrl || `${import.meta.env.BASE_URL}2d.png`}
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

                      {/* Lista de operações expansiva */}
                      <section className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Operações do Projeto</h2>
                        <div className="flex flex-col gap-6">
                          {selectedProgram.operations.length === 0 && (
                            <div className="text-center text-gray-500">Nenhuma operação cadastrada para este projeto.</div>
                          )}
                          {selectedProgram.operations.map((operation, index) => (
                            <OperationCard
                              key={`${selectedProgram.id}-${operation.id || index}`}
                              operation={operation}
                              expanded={expandedOperations.includes(operation.id || index)}
                              onExpand={() => toggleOperationExpand(operation.id || index)}
                              onSign={() => {}}
                              onView={() => setSelectedOperation(operation)}
                              projectId={selectedProgram.projectId || selectedProgram.id}
                            />
                          ))}
                        </div>
                      </section>

                      {/* Botão de exportar logs */}
                      <div className="mt-6 flex justify-end">
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
                ) : (
                  // Visualização detalhada da operação no histórico
                  <div className="relative group rounded-2xl shadow-xl border-0 bg-gradient-to-br from-white via-[#f3f4f6] to-[#e6f4f1] overflow-hidden transition-transform max-w-5xl mx-auto mt-8 border-l-8" style={{ borderLeftColor: '#22c55e' }}>
                    <div className="px-6 py-8">
                      <div className="flex items-center gap-3 mb-6">
                        <button
                          onClick={() => setSelectedOperation(null)}
                          className="text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full p-2 border border-gray-200"
                          title="Voltar"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Operação #{selectedOperation?.sequence}
                          </span>
                          <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {selectedOperation?.type} <span className="text-base font-normal text-gray-500">({selectedOperation?.function})</span>
                          </span>
                          <span className="text-xs text-gray-500">
                            Ferramenta: <span className="font-semibold text-gray-700">{selectedOperation?.toolRef}</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-gray-50 p-4 rounded-lg mt-4">
                            <h3 className="text-sm font-medium text-[#04514B] mb-2">Detalhes da Operação</h3>
                            <dl className="divide-y divide-gray-100 bg-white/60 rounded-lg p-3 shadow-sm">
                              <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Ferramenta:</dt><dd className="text-gray-900 font-semibold">{selectedOperation?.toolRef}</dd></div>
                              <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Velocidade:</dt><dd className="text-gray-900 font-semibold">{selectedOperation?.details.speed}</dd></div>
                              <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Avanço:</dt><dd className="text-gray-900 font-semibold">{selectedOperation?.details.feed}</dd></div>
                              <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Profundidade:</dt><dd className="text-gray-900 font-semibold">{selectedOperation?.details.depth}</dd></div>
                              <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Tolerância:</dt><dd className="text-gray-900 font-semibold">{selectedOperation?.quality.tolerance}</dd></div>
                              <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Acabamento:</dt><dd className="text-gray-900 font-semibold">{selectedOperation?.quality.surfaceFinish}</dd></div>
                              <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Operador:</dt><dd className="text-gray-900 font-semibold">{selectedOperation?.signedBy}</dd></div>
                              <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Medição:</dt><dd className="text-gray-900 font-semibold">{selectedOperation?.measurementValue}mm</dd></div>
                            </dl>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg mt-4">
                            <h3 className="text-sm font-medium text-[#04514B] mb-2">Folha de Processo</h3>
                            <dl className="divide-y divide-gray-100 bg-white/60 rounded-lg p-3 shadow-sm">
                              {PROCESS_FIELDS.map(({ key, label }) => (
                                <div className="grid grid-cols-2 py-1" key={key}>
                                  <dt className="text-gray-500">{label}</dt>
                                  <dd className="text-gray-900 font-semibold">{(selectedOperation as any)?.[key] || '—'}</dd>
                                </div>
                              ))}
                            </dl>
                          </div>                          
                          {selectedOperation?.details.notes && (
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
                              src={selectedProgram.imageUrl || `${import.meta.env.BASE_URL}2d.png`}
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
            {activeTab === 'admin' && operator?.role === 'admin' && (
              <AdminPanel />
            )}
          </main>
        </div>
      </div>

      {/* Botão para abrir modal de login de operador/admin */}
      {!operator && (
        <button onClick={() => setOperatorLoginModal(true)} className="ml-2 px-3 py-1 bg-blue-600 text-white rounded">Login Admin/Operador</button>
      )}
      {operator && (
        <span className="ml-2 text-green-700 font-bold">{operator.name} ({operator.role}) <button onClick={handleOperatorLogout} className="ml-2 text-red-600">Sair</button></span>
      )}

      {/* Modal de login de operador/admin */}
      {operatorLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Administrativo</h2>
              <p className="text-gray-600">Faça login como operador/admin para acessar esta área</p>
            </div>
            
            <form onSubmit={handleOperatorLogin} className="space-y-4">
              <div>
                <label htmlFor="operatorCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Código do Operador
                </label>
                <input 
                  type="text" 
                  id="operatorCode"
                  value={operatorCode} 
                  onChange={e => setOperatorCode(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Digite seu código"
                  required
                  autoFocus 
                />
              </div>
              
              <div>
                <label htmlFor="operatorPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input 
                  type="password" 
                  id="operatorPassword"
                  value={operatorPassword} 
                  onChange={e => setOperatorPassword(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Digite sua senha"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Entrar
                </button>
                <button 
                  type="button" 
                  onClick={() => setOperatorLoginModal(false)} 
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Credenciais de Teste:</h3>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Admin:</strong> admin / admin123</p>
                <p><strong>Luiz:</strong> luiz / luiz123</p>
                <p><strong>Operador:</strong> op1 / op1pass</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;

























