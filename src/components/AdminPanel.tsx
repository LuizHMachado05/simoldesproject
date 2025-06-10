import React, { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { 
  Users, 
  Factory, 
  Database, 
  Settings, 
  Shield, 
  AlertTriangle, 
  FileText, 
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Check,
  ClipboardList,
  Calendar,
  Upload,
  User,
  Key,
  Lock
} from 'lucide-react';
import { getOperators, Operator } from '../services/operatorService';
import machinesData from '../data/machines.json';
import { ProgramEditModal } from './ProgramEditModal';
import { validateAndFormatImportedProject } from '../utils/projectImport';
import type { MoldProgram as ImportedMoldProgram } from '../types/project';

// Interface para máquina
interface Machine {
  codigo_maquina: string;
  nome_maquina: string;
  status: string;
  tipo: string;
  capacidade: string;
  ultima_manutencao: string;
}

// Interface para projeto/programa
interface MoldProgram {
  id: string;
  name: string;
  machine: string;
  programPath: string;
  material: string;
  date: string;
  programmer: string;
  blockCenter: string;
  reference: string;
  observations: string;
  imageUrl: string;
  operations: Operation[];
}

// Interface para operação
interface Operation {
  id: number;
  sequence: string;
  type: string;
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
  quality?: {
    tolerance: string;
    surfaceFinish: string;
    requirements: string[];
  };
  timeRecord?: {
    start: string;
    end: string;
  };
}

// Funções de filtro com tipagem
const filterOperators = (operators: Operator[], searchTerm: string): Operator[] => {
  return operators.filter((operator: Operator) => 
    operator.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operator.matricula.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

const filterMachines = (machines: Machine[], searchTerm: string): Machine[] => {
  return machines.filter((machine: Machine) =>
    machine.nome_maquina.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.codigo_maquina.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

const filterPrograms = (programs: MoldProgram[], searchTerm: string): MoldProgram[] => {
  return programs.filter((program: MoldProgram) =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

interface AdminPanelProps {
  onImportProject?: (projects: ImportedMoldProgram | ImportedMoldProgram[]) => void;
}

export function AdminPanel({ onImportProject }: AdminPanelProps): ReactElement {
  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [operators, setOperators] = useState<Operator[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [programs, setPrograms] = useState<MoldProgram[]>([]);
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<MoldProgram[]>([]);
  
  // Estados para edição
  const [editingOperator, setEditingOperator] = useState<string | null>(null);
  const [editingMachine, setEditingMachine] = useState<string | null>(null);
  const [editingProgram, setEditingProgram] = useState<string | null>(null);
  const [editedOperatorData, setEditedOperatorData] = useState<Partial<Operator>>({});
  const [editedMachineData, setEditedMachineData] = useState<Partial<Machine>>({});
  const [editedProgramData, setEditedProgramData] = useState<Partial<MoldProgram>>({});
  
  // Estado para modal de adição
  const [showAddModal, setShowAddModal] = useState<'operator' | 'machine' | 'program' | null>(null);
  const [newOperator, setNewOperator] = useState<Partial<Operator>>({
    nome: '',
    matricula: '',
    cargo: '',
    turno: 'Manhã'
  });
  const [newMachine, setNewMachine] = useState<Partial<Machine>>({
    codigo_maquina: '',
    nome_maquina: '',
    status: 'ativo',
    tipo: '',
    capacidade: '',
    ultima_manutencao: new Date().toISOString().split('T')[0]
  });
  const [newProgram, setNewProgram] = useState<Partial<MoldProgram>>({
    id: '',
    name: '',
    machine: '',
    programPath: '',
    material: '',
    date: new Date().toLocaleDateString('pt-BR'),
    programmer: '',
    blockCenter: '',
    reference: '',
    observations: '',
    operations: []
  });

  const [showDetailedEditModal, setShowDetailedEditModal] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(true);

  // Logs de exemplo (mantidos como mock pois não temos um JSON para isso)
  const mockLogs = [
    { id: 1, type: 'Login', user: 'João Silva', machine: 'F1400', timestamp: '2023-05-15 08:30:15', details: 'Login bem-sucedido' },
    { id: 2, type: 'Operação', user: 'Maria Silva', machine: 'F1400', timestamp: '2023-05-15 09:45:22', details: 'Operação #123 concluída' },
    { id: 3, type: 'Erro', user: 'Sistema', machine: 'T2500', timestamp: '2023-05-15 10:12:05', details: 'Falha na conexão com o banco de dados' },
    { id: 4, type: 'Manutenção', user: 'Carlos Pereira', machine: 'T2500', timestamp: '2023-05-15 11:30:00', details: 'Início de manutenção preventiva' },
  ];

  // Programas de exemplo
  const mockPrograms: MoldProgram[] = [
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
      imageUrl: '/images/program-cover.jpg',
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
        }
      ]
    },
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
      imageUrl: '/images/program-cover.jpg',
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
          }
        }
      ]
    }
  ];

  useEffect(() => {
    // Carregar dados iniciais
    loadData();
  }, []);

  useEffect(() => {
    // Filtrar operadores com base no termo de pesquisa
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      setFilteredOperators(
        filterOperators(operators, lowerSearchTerm)
      );
      
      // Filtrar máquinas com base no termo de pesquisa
      setFilteredMachines(
        filterMachines(machines, lowerSearchTerm)
      );

      // Filtrar programas com base no termo de pesquisa
      setFilteredPrograms(
        filterPrograms(programs, lowerSearchTerm)
      );
    } else {
      setFilteredOperators(operators);
      setFilteredMachines(machines);
      setFilteredPrograms(programs);
    }
  }, [searchTerm, operators, machines, programs]);

  const loadData = () => {
    setIsLoading(true);
    
    try {
      // Carregar operadores do serviço
      const operatorsData = getOperators();
      setOperators(operatorsData);
      setFilteredOperators(operatorsData);
      
      // Carregar máquinas do JSON importado e mapear para o formato correto
      const mappedMachines = machinesData.map(m => ({
        codigo_maquina: m.codigo_maquina,
        nome_maquina: m.nome_maquina,
        status: m.status,
        tipo: '',  // Valores padrão para os campos ausentes
        capacidade: '',
        ultima_manutencao: ''
      }));
      setMachines(mappedMachines);
      setFilteredMachines(mappedMachines);

      // Carregar programas do mock
      setPrograms(mockPrograms);
      setFilteredPrograms(mockPrograms);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    
    try {
      switch (activeTab) {
        case 'users':
          // Recarregar operadores
          const operatorsData = getOperators();
          setOperators(operatorsData);
          setFilteredOperators(operatorsData);
          break;
        
        case 'machines':
          // Recarregar máquinas
          const mappedMachines = machinesData.map(m => ({
            codigo_maquina: m.codigo_maquina,
            nome_maquina: m.nome_maquina,
            status: m.status,
            tipo: '',
            capacidade: '',
            ultima_manutencao: ''
          }));
          setMachines(mappedMachines);
          setFilteredMachines(mappedMachines);
          break;
        
        case 'programs':
          // Recarregar programas
          setPrograms(mockPrograms);
          setFilteredPrograms(mockPrograms);
          break;
        
        case 'logs':
          // Recarregar logs (quando implementado)
          // Por enquanto usa dados mock
          break;
      }

      // Limpar estados de edição
      setEditingOperator(null);
      setEditingMachine(null);
      setEditingProgram(null);
      setEditedOperatorData({});
      setEditedMachineData({});
      setEditedProgramData({});
      setShowDetailedEditModal(null);

      // Feedback visual de sucesso
      alert('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      alert('Erro ao atualizar os dados. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Funções para edição de operadores
  const startEditingOperator = (matricula: string) => {
    const operator = operators.find(op => op.matricula === matricula);
    if (operator) {
      setEditingOperator(matricula);
      setEditedOperatorData({ ...operator });
    }
  };

  const cancelEditingOperator = () => {
    setEditingOperator(null);
    setEditedOperatorData({});
  };

  const saveOperator = (matricula: string) => {
    setOperators(prevOperators => 
      prevOperators.map(op => 
        op.matricula === matricula ? { ...op, ...editedOperatorData } : op
      )
    );
    setEditingOperator(null);
    setEditedOperatorData({});
  };

  const deleteOperator = (matricula: string) => {
    if (window.confirm('Tem certeza que deseja excluir este operador?')) {
      setOperators(prevOperators => 
        prevOperators.filter(op => op.matricula !== matricula)
      );
    }
  };

  const handleOperatorChange = (field: keyof Operator, value: string) => {
    setEditedOperatorData(prev => ({ ...prev, [field]: value }));
  };

  // Funções para edição de máquinas
  const startEditingMachine = (codigo: string) => {
    const machine = machines.find(m => m.codigo_maquina === codigo);
    if (machine) {
      setEditingMachine(codigo);
      setEditedMachineData({ ...machine });
    }
  };

  const cancelEditingMachine = () => {
    setEditingMachine(null);
    setEditedMachineData({});
  };

  const saveMachine = (codigo: string) => {
    setMachines(prevMachines => 
      prevMachines.map(m => 
        m.codigo_maquina === codigo ? { ...m, ...editedMachineData } : m
      )
    );
    setEditingMachine(null);
    setEditedMachineData({});
  };

  const deleteMachine = (codigo: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta máquina?')) {
      setMachines(prevMachines => 
        prevMachines.filter(m => m.codigo_maquina !== codigo)
      );
    }
  };

  const handleMachineChange = (field: keyof Machine, value: string) => {
    setEditedMachineData(prev => ({ ...prev, [field]: value }));
  };

  // Funções para edição de programas
  const startEditingProgram = (id: string) => {
    const program = programs.find(p => p.id === id);
    if (program) {
      setEditingProgram(id);
      setEditedProgramData({ ...program });
    }
  };

  const cancelEditingProgram = () => {
    setEditingProgram(null);
    setEditedProgramData({});
  };

  const saveProgram = (id: string) => {
    setPrograms(prevPrograms => 
      prevPrograms.map(p => 
        p.id === id ? { ...p, ...editedProgramData } : p
      )
    );
    setEditingProgram(null);
    setEditedProgramData({});
  };

  const deleteProgram = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este programa?')) {
      setPrograms(prevPrograms => 
        prevPrograms.filter(p => p.id !== id)
      );
    }
  };

  const handleProgramChange = (field: keyof MoldProgram, value: any) => {
    setEditedProgramData(prev => ({ ...prev, [field]: value }));
  };

  // Funções para adicionar novos itens
  const handleAddOperator = () => {
    if (!newOperator.nome || !newOperator.matricula || !newOperator.cargo) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Verificar se a matrícula já existe
    if (operators.some(op => op.matricula === newOperator.matricula)) {
      alert('Esta matrícula já está em uso.');
      return;
    }

    const operatorToAdd = {
      nome: newOperator.nome,
      matricula: newOperator.matricula,
      cargo: newOperator.cargo,
      turno: newOperator.turno || 'Manhã'
    } as Operator;

    setOperators(prev => [...prev, operatorToAdd]);
    setShowAddModal(null);
    setNewOperator({
      nome: '',
      matricula: '',
      cargo: '',
      turno: 'Manhã'
    });
  };

  const handleAddMachine = () => {
    if (!newMachine.codigo_maquina || !newMachine.nome_maquina) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Verificar se o código já existe
    if (machines.some(m => m.codigo_maquina === newMachine.codigo_maquina)) {
      alert('Este código de máquina já está em uso.');
      return;
    }

    const machineToAdd = {
      codigo_maquina: newMachine.codigo_maquina,
      nome_maquina: newMachine.nome_maquina,
      status: newMachine.status || 'ativo',
      tipo: newMachine.tipo || '',
      capacidade: newMachine.capacidade || '',
      ultima_manutencao: newMachine.ultima_manutencao || new Date().toISOString().split('T')[0]
    } as Machine;

    setMachines(prev => [...prev, machineToAdd]);
    setShowAddModal(null);
    setNewMachine({
      codigo_maquina: '',
      nome_maquina: '',
      status: 'ativo',
      tipo: '',
      capacidade: '',
      ultima_manutencao: new Date().toISOString().split('T')[0]
    });
  };

  const handleAddProgram = () => {
    if (!newProgram.id || !newProgram.name || !newProgram.machine) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Verificar se o ID já existe
    if (programs.some(p => p.id === newProgram.id)) {
      alert('Este ID de programa já está em uso.');
      return;
    }

    const programToAdd = {
      id: newProgram.id,
      name: newProgram.name,
      machine: newProgram.machine,
      programPath: newProgram.programPath || `U:/${newProgram.machine}/${newProgram.id}`,
      material: newProgram.material || '',
      date: newProgram.date || new Date().toLocaleDateString('pt-BR'),
      programmer: newProgram.programmer || '',
      blockCenter: newProgram.blockCenter || 'X0,0 Y0,0',
      reference: newProgram.reference || '',
      observations: newProgram.observations || '',
      imageUrl: '/images/program-cover.jpg',
      operations: []
    } as MoldProgram;

    setPrograms(prev => [...prev, programToAdd]);
    setShowAddModal(null);
    setNewProgram({
      id: '',
      name: '',
      machine: '',
      programPath: '',
      material: '',
      date: new Date().toLocaleDateString('pt-BR'),
      programmer: '',
      blockCenter: '',
      reference: '',
      observations: '',
      operations: []
    });
  };

  const handleDetailedEdit = (program: MoldProgram) => {
    setEditedProgramData(program);
    setShowDetailedEditModal(program.id);
  };

  const handleSaveDetailedEdit = (updatedProgram: MoldProgram) => {
    // Aqui você implementaria a lógica para salvar as alterações no banco de dados
    const updatedPrograms = programs.map(p => 
      p.id === updatedProgram.id ? updatedProgram : p
    );
    setPrograms(updatedPrograms);
    setFilteredPrograms(updatedPrograms);
    setShowDetailedEditModal(null);
  };

  const handleImportJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);
      const formattedProjects = validateAndFormatImportedProject(jsonData);
      
      // Atualizar a lista local de projetos
      if (Array.isArray(formattedProjects)) {
        setPrograms(prev => [...prev, ...formattedProjects]);
        setFilteredPrograms(prev => [...prev, ...formattedProjects]);
      } else {
        setPrograms(prev => [...prev, formattedProjects]);
        setFilteredPrograms(prev => [...prev, formattedProjects]);
      }

      // Chamar a função de callback se existir
      if (onImportProject) {
        onImportProject(formattedProjects);
      }

      alert('Projeto(s) importado(s) com sucesso!');
    } catch (error) {
      console.error('Erro ao importar arquivo:', error);
      alert('Erro ao importar arquivo. Verifique se o formato está correto.');
    }

    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';
  };

  const renderProgramsTab = () => {
    return (
      <div className="space-y-4">
        <div className="grid gap-4">
          {filteredPrograms.map((program) => (
            <div key={program.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{program.name}</h3>
                  <p className="text-gray-600">Máquina: {program.machine}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDetailedEdit(program)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteProgram(program.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Por enquanto, aceita qualquer senha
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <Lock className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">Área Restrita</h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha de Administrador
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Digite a senha"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Cabeçalho */}
          <div className="bg-primary p-6">
            <h1 className="text-2xl font-bold text-white">Painel de Administração</h1>
            <p className="text-primary-100 text-white">Gerencie usuários, máquinas, projetos e configurações do sistema</p>
          </div>

          {/* Navegação por abas */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-5 w-5 inline-block mr-2" />
                Usuários
              </button>
              <button
                onClick={() => setActiveTab('machines')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'machines'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Factory className="h-5 w-5 inline-block mr-2" />
                Máquinas
              </button>
              <button
                onClick={() => setActiveTab('programs')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'programs'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ClipboardList className="h-5 w-5 inline-block mr-2" />
                Projetos
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'logs'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <AlertTriangle className="h-5 w-5 inline-block mr-2" />
                Logs do Sistema
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="h-5 w-5 inline-block mr-2" />
                Configurações
              </button>
            </nav>
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            {/* Barra de ferramentas */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                {activeTab === 'users' && (
                  <button 
                    onClick={() => setShowAddModal('operator')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Adicionar Usuário</span>
                  </button>
                )}
                {activeTab === 'machines' && (
                  <button 
                    onClick={() => setShowAddModal('machine')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Adicionar Máquina</span>
                  </button>
                )}
                {activeTab === 'programs' && (
                  <button 
                    onClick={() => setShowAddModal('program')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Adicionar Projeto</span>
                  </button>
                )}
                {activeTab === 'programs' && (
                  <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                    <Upload className="h-5 w-5" />
                    <span>Import from JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                  </label>
                )}
                <button 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
                  }`}
                >
                  <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Atualizando...' : 'Atualizar'}</span>
                </button>
              </div>
            </div>

            {/* Conteúdo das abas */}
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Matrícula
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Turno
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOperators.map((operator) => (
                      <tr key={operator.matricula} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingOperator === operator.matricula ? (
                            <input
                              type="text"
                              value={editedOperatorData.nome || ''}
                              onChange={(e) => handleOperatorChange('nome', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{operator.nome}</div>
                                <div className="text-sm text-gray-500">{operator.matricula}@simoldes.com</div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingOperator === operator.matricula ? (
                            <input
                              type="text"
                              value={editedOperatorData.matricula || ''}
                              onChange={(e) => handleOperatorChange('matricula', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            operator.matricula
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingOperator === operator.matricula ? (
                            <select
                              value={editedOperatorData.cargo || ''}
                              onChange={(e) => handleOperatorChange('cargo', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            >
                              <option value="Operador">Operador</option>
                              <option value="Supervisor">Supervisor</option>
                              <option value="Gerente">Gerente</option>
                              <option value="Técnico">Técnico</option>
                            </select>
                          ) : (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              operator.cargo.includes('Supervisor') 
                                ? 'bg-blue-100 text-blue-800' 
                                : operator.cargo.includes('Gerente')
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-green-100 text-green-800'
                            }`}>
                              {operator.cargo}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingOperator === operator.matricula ? (
                            <select
                              value={editedOperatorData.turno || ''}
                              onChange={(e) => handleOperatorChange('turno', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            >
                              <option value="Manhã">Manhã</option>
                              <option value="Tarde">Tarde</option>
                              <option value="Noite">Noite</option>
                            </select>
                          ) : (
                            operator.turno
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {editingOperator === operator.matricula ? (
                              <>
                                <button 
                                  onClick={() => saveOperator(operator.matricula)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <Check className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={cancelEditingOperator}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => startEditingOperator(operator.matricula)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Editar"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button
                                  className="text-yellow-600 hover:text-yellow-900"
                                  title="Reset de Senha"
                                >
                                  <Key className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => deleteOperator(operator.matricula)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Excluir"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'machines' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMachines.map((machine) => (
                      <tr key={machine.codigo_maquina} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {editingMachine === machine.codigo_maquina ? (
                            <input
                              type="text"
                              value={editedMachineData.codigo_maquina || ''}
                              onChange={(e) => handleMachineChange('codigo_maquina', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            machine.codigo_maquina
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingMachine === machine.codigo_maquina ? (
                            <input
                              type="text"
                              value={editedMachineData.nome_maquina || ''}
                              onChange={(e) => handleMachineChange('nome_maquina', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            machine.nome_maquina
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingMachine === machine.codigo_maquina ? (
                            <select
                              value={editedMachineData.status || ''}
                              onChange={(e) => handleMachineChange('status', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            >
                              <option value="ativo">Ativo</option>
                              <option value="manutenção">Manutenção</option>
                              <option value="inativo">Inativo</option>
                            </select>
                          ) : (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              machine.status === 'ativo' 
                                ? 'bg-green-100 text-green-800' 
                                : machine.status === 'manutenção'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingMachine === machine.codigo_maquina ? (
                            <input
                              type="text"
                              value={editedMachineData.tipo || ''}
                              onChange={(e) => handleMachineChange('tipo', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            machine.tipo || '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {editingMachine === machine.codigo_maquina ? (
                              <>
                                <button 
                                  onClick={() => saveMachine(machine.codigo_maquina)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <Check className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={cancelEditingMachine}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => startEditingMachine(machine.codigo_maquina)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => deleteMachine(machine.codigo_maquina)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Aba de Projetos */}
            {activeTab === 'programs' && (
              renderProgramsTab()
            )}

            {/* Modal para adicionar programa */}
            {showAddModal === 'program' && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Novo Projeto</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID do Projeto *
                      </label>
                      <input
                        type="text"
                        value={newProgram.id}
                        onChange={(e) => setNewProgram({ ...newProgram, id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Ex: 1670_20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Projeto *
                      </label>
                      <input
                        type="text"
                        value={newProgram.name}
                        onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Ex: MOLDE LATERAL ESQUERDO"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Máquina *
                      </label>
                      <select
                        value={newProgram.machine}
                        onChange={(e) => setNewProgram({ ...newProgram, machine: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="">Selecione uma máquina</option>
                        {machines.map((machine) => (
                          <option key={machine.codigo_maquina} value={machine.codigo_maquina}>
                            {machine.nome_maquina}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Material
                      </label>
                      <input
                        type="text"
                        value={newProgram.material}
                        onChange={(e) => setNewProgram({ ...newProgram, material: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Ex: 1730"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Programador
                      </label>
                      <input
                        type="text"
                        value={newProgram.programmer}
                        onChange={(e) => setNewProgram({ ...newProgram, programmer: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Ex: nome.sobrenome"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações
                      </label>
                      <textarea
                        value={newProgram.observations}
                        onChange={(e) => setNewProgram({ ...newProgram, observations: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        rows={3}
                        placeholder="Observações importantes sobre o projeto"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setShowAddModal(null)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddProgram}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal para adicionar operador */}
            {showAddModal === 'operator' && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Novo Operador</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        value={newOperator.nome}
                        onChange={(e) => setNewOperator({ ...newOperator, nome: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Ex: João Silva"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Matrícula *
                      </label>
                      <input
                        type="text"
                        value={newOperator.matricula}
                        onChange={(e) => setNewOperator({ ...newOperator, matricula: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Ex: OP12345"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cargo *
                      </label>
                      <input
                        type="text"
                        value={newOperator.cargo}
                        onChange={(e) => setNewOperator({ ...newOperator, cargo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Ex: Operador CNC"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Turno
                      </label>
                      <select
                        value={newOperator.turno}
                        onChange={(e) => setNewOperator({ ...newOperator, turno: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="Manhã">Manhã</option>
                        <option value="Tarde">Tarde</option>
                        <option value="Noite">Noite</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setShowAddModal(null)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddOperator}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal para adicionar máquina */}
            {showAddModal === 'machine' && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Nova Máquina</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código da Máquina *
                      </label>
                      <input
                        type="text"
                        value={newMachine.codigo_maquina}
                        onChange={(e) => setNewMachine({ ...newMachine, codigo_maquina: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Ex: F1400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome da Máquina *
                      </label>
                      <input
                        type="text"
                        value={newMachine.nome_maquina}
                        onChange={(e) => setNewMachine({ ...newMachine, nome_maquina: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Ex: Fresadora CNC 1400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={newMachine.status}
                        onChange={(e) => setNewMachine({ ...newMachine, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                        <option value="manutenção">Em Manutenção</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <input
                        type="text"
                        value={newMachine.tipo}
                        onChange={(e) => setNewMachine({ ...newMachine, tipo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Ex: Fresadora CNC"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacidade
                      </label>
                      <input
                        type="text"
                        value={newMachine.capacidade}
                        onChange={(e) => setNewMachine({ ...newMachine, capacidade: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Ex: 1400x800x600mm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Última Manutenção
                      </label>
                      <input
                        type="date"
                        value={newMachine.ultima_manutencao}
                        onChange={(e) => setNewMachine({ ...newMachine, ultima_manutencao: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setShowAddModal(null)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddMachine}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Aba de Logs */}
            {activeTab === 'logs' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Máquina
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data/Hora
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Detalhes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{log.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            log.type === 'Erro' 
                              ? 'bg-red-100 text-red-800' 
                              : log.type === 'Manutenção'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.user}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.machine}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.timestamp}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.details}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Aba de Configurações */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações do Sistema</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome da Empresa
                      </label>
                      <input
                        type="text"
                        defaultValue="Simoldes Group"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diretório de Programas
                      </label>
                      <input
                        type="text"
                        defaultValue="U:/"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Intervalo de Backup (horas)
                      </label>
                      <input
                        type="number"
                        defaultValue={24}
                        min={1}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        id="auto-logout"
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="auto-logout" className="ml-2 block text-sm text-gray-900">
                        Logout automático após 30 minutos de inatividade
                      </label>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                      Salvar Configurações
                    </button>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Banco de Dados</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status da Conexão
                      </label>
                      <div className="flex items-center">
                        <span className="inline-block h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                        <span className="text-sm text-gray-700">Conectado</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome da Empresa
                      </label>
                      <input
                        type="text"
                        defaultValue="Simoldes Group"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diretório de Programas
                      </label>
                      <input
                        type="text"
                        defaultValue="U:/"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Intervalo de Backup (horas)
                      </label>
                      <input
                        type="number"
                        defaultValue={24}
                        min={1}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        id="auto-logout"
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="auto-logout" className="ml-2 block text-sm text-gray-900">
                        Logout automático após 30 minutos de inatividade
                      </label>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                      Salvar Configurações
                    </button>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Banco de Dados</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status da Conexão
                      </label>
                      <div className="flex items-center">
                        <span className="inline-block h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                        <span className="text-sm text-gray-700">Conectado</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome da Empresa
                      </label>
                      <input
                        type="text"
                        defaultValue="Simoldes Group"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diretório de Programas
                      </label>
                      <input
                        type="text"
                        defaultValue="U:/"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Intervalo de Backup (horas)
                      </label>
                      <input
                        type="number"
                        defaultValue={24}
                        min={1}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        id="auto-logout"
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="auto-logout" className="ml-2 block text-sm text-gray-900">
                        Logout automático após 30 minutos de inatividade
                      </label>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                      Salvar Configurações
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showDetailedEditModal && editedProgramData && (
              <ProgramEditModal
                program={editedProgramData as MoldProgram}
                onClose={() => setShowDetailedEditModal(null)}
                onSave={handleSaveDetailedEdit}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

