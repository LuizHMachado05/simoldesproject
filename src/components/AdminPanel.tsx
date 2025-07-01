import React, { useState, useEffect, useRef } from 'react';
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
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { getOperators, createOperator, updateOperator, deleteOperator, Operator } from '../services/operatorService';
import { getMachines, createMachine, updateMachine, deleteMachine, Machine } from '../services/machineService';
import { getProjectsWithOperations, createProject, updateProject, deleteProject, Project } from '../services/projectService';
import { getLogs, createLog, deleteLog, clearOldLogs, Log, LogFilters } from '../services/logService';
import { logActivity, logOperation, logError } from '../services/logService';
import machinesData from '../data/machines.json';
import { ProgramEditModal } from './ProgramEditModal';
import { OperationImportModal } from './OperationImportModal';

// Interface para projeto/programa
interface MoldProgram {
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
  operations?: Operation[];
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
  completed?: boolean;
}

// Adicionar tipo CsvOperation para operações importadas do CSV
interface CsvOperation {
  [key: string]: any;
}

// Adicionar tipo para operação manual
interface ManualOperation {
  id: number;
  type?: string;
  toolRef?: string;
  notes?: string;
  [key: string]: any;
}

// Lista de campos do CSV
const csvFields = [
  'Nº',
  'Tipo de Operação',
  'Observação',
  'Ø',
  'Passos',
  'Z Min',
  'Tolerância',
  'Rotação',
  'Avanço',
  'Ferramenta',
  'Suporte',
];

// Funções de filtro com tipagem
const filterOperators = (operators: Operator[], searchTerm: string): Operator[] => {
  return operators.filter((operator: Operator) => 
    operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operator.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

const filterMachines = (machines: Machine[], searchTerm: string): Machine[] => {
  return machines.filter((machine: Machine) =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.machineId.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

const filterPrograms = (programs: MoldProgram[], searchTerm: string): MoldProgram[] => {
  return programs.filter((program: MoldProgram) =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.projectId.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Modal para cadastro de operação dinâmica (corrigido)
function OperationModal({ isOpen, onClose, onSave, initialOperation }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (op: any) => void;
  initialOperation?: any;
}) {
  // Inicializa o estado do formulário com todos os campos do CSV
  const emptyOperation = csvFields.reduce((acc, field) => ({ ...acc, [field]: '' }), {});
  const [operation, setOperation] = useState<any>(initialOperation || emptyOperation);

  // Atualiza apenas o campo alterado
  const handleChange = (field: string, value: string) => {
    setOperation((prev: any) => ({ ...prev, [field]: value }));
  };

  // Quando abrir o modal, reseta o formulário se for para adicionar
  React.useEffect(() => {
    if (isOpen && !initialOperation) {
      setOperation(emptyOperation);
    }
    if (isOpen && initialOperation) {
      setOperation(initialOperation);
    }
    // eslint-disable-next-line
  }, [isOpen, initialOperation]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Adicionar Operação</h3>
        <div className="grid grid-cols-2 gap-3">
          {csvFields.map(field => (
            <div key={field} className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">{field}</label>
              <input
                className="border rounded px-2 py-1"
                placeholder={field}
                value={operation[field] || ''}
                onChange={e => handleChange(field, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Cancelar</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => onSave(operation)}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

interface AdminPanelProps {
  machineId?: string;
}

export function AdminPanel({ machineId }: AdminPanelProps): ReactElement {
  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [operators, setOperators] = useState<Operator[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [programs, setPrograms] = useState<MoldProgram[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<MoldProgram[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  
  // Estados para filtros de logs
  const [logFilters, setLogFilters] = useState<LogFilters>({});
  const [showLogFilters, setShowLogFilters] = useState(false);
  
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
    name: '',
    code: '',
    role: undefined,
    active: true
  });
  const [newMachine, setNewMachine] = useState<Partial<Machine>>({
    machineId: '',
    name: '',
    password: '',
    status: 'active'
  });
  const [newProgram, setNewProgram] = useState<Partial<MoldProgram>>({
    projectId: '',
    name: '',
    machine: '',
    programPath: '',
    material: '',
    date: new Date(),
    programmer: '',
    blockCenter: '',
    reference: '',
    observations: '',
    status: 'in_progress',
    operations: []
  });

  const [showDetailedEditModal, setShowDetailedEditModal] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState<string | null>(null);

  // Estado para operação em edição
  const [newOperation, setNewOperation] = useState<ManualOperation>({ id: 1 });
  const [editingOperation, setEditingOperation] = useState<ManualOperation | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Estado do modal
  const [showOperationModal, setShowOperationModal] = useState<string | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfJsonResult, setPdfJsonResult] = useState<any>(null);
  const [pdfJsonLoading, setPdfJsonLoading] = useState(false);
  const [pdfJsonError, setPdfJsonError] = useState('');

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      // Carregar operadores da API
      const operatorsData = await getOperators();
      setOperators(operatorsData);
      setFilteredOperators(operatorsData);
      
      // Carregar máquinas da API
      const machinesData = await getMachines();
      setMachines(machinesData);
      setFilteredMachines(machinesData);
      
      // Carregar projetos da API
      const projectsData = await getProjectsWithOperations();
      setPrograms(projectsData);
      setFilteredPrograms(projectsData);
      
      // Carregar logs da API
      const logsData = await getLogs();
      setLogs(logsData);
      setFilteredLogs(logsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }

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

  const handleRefresh = async () => {
    setIsLoading(true);
    
    try {
      // Log de início da atualização
      await logOperation('Admin', 'Sistema', `Iniciando atualização de dados da aba ${activeTab}`);
      
      switch (activeTab) {
        case 'users':
          const operatorsData = await getOperators();
          setOperators(operatorsData);
          setFilteredOperators(operatorsData);
          break;
        
        case 'machines':
          // Recarregar máquinas
          const machinesData = await getMachines();
          setMachines(machinesData);
          setFilteredMachines(machinesData);
          break;
        
        case 'programs':
          // Recarregar projetos da API
          const projectsData = await getProjectsWithOperations();
          setPrograms(projectsData);
          setFilteredPrograms(projectsData);
          break;
        
        case 'logs':
          // Recarregar logs da API
          const logsData = await getLogs(logFilters);
          setLogs(logsData);
          setFilteredLogs(logsData);
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
      setShowImportModal(null);

      // Log de atualização bem-sucedida
      await logOperation('Admin', 'Sistema', `Dados da aba ${activeTab} atualizados com sucesso`);

      // Feedback visual de sucesso
      alert('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      
      // Log de erro na atualização
      await logError('Admin', 'Sistema', `Erro ao atualizar dados da aba ${activeTab}: ${error}`);
      
      alert('Erro ao atualizar os dados. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Funções para gerenciar logs
  const refreshLogs = async () => {
    try {
      const logsData = await getLogs(logFilters);
      setLogs(logsData);
      setFilteredLogs(logsData);
    } catch (error) {
      console.error('Erro ao recarregar logs:', error);
    }
  };

  const deleteLogHandler = async (logId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este log?')) {
      try {
        // Buscar o log antes de deletar para registrar a ação
        const logToDelete = logs.find(log => log._id === logId);
        
        await deleteLog(logId);
        
        // Log de log deletado
        if (logToDelete) {
          await logOperation('Admin', 'Sistema', `Log deletado: ${logToDelete.type} - ${logToDelete.user} - ${logToDelete.details}`);
        }
        
        await refreshLogs();
      } catch (error) {
        console.error('Erro ao remover log:', error);
        
        // Log de erro ao deletar log
        await logError('Admin', 'Sistema', `Erro ao deletar log ${logId}: ${error}`);
        
        alert('Erro ao remover log');
      }
    }
  };

  const clearOldLogsHandler = async () => {
    const days = prompt('Digite o número de dias para manter os logs (padrão: 30):', '30');
    if (days) {
      try {
        const result = await clearOldLogs(parseInt(days));
        
        // Log de limpeza de logs
        await logOperation('Admin', 'Sistema', `${result.deletedCount} logs antigos (mais de ${days} dias) foram removidos`);
        
        alert(`${result.deletedCount} logs antigos foram removidos`);
        await refreshLogs();
      } catch (error) {
        console.error('Erro ao limpar logs antigos:', error);
        
        // Log de erro ao limpar logs
        await logError('Admin', 'Sistema', `Erro ao limpar logs antigos: ${error}`);
        
        alert('Erro ao limpar logs antigos');
      }
    }
  };

  const applyLogFilters = async () => {
    try {
      const filteredLogsData = await getLogs(logFilters);
      setFilteredLogs(filteredLogsData);
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
    }
  };

  const resetLogFilters = () => {
    setLogFilters({});
    setFilteredLogs(logs);
  };

  const refreshOperators = async () => {
    const operatorsData = await getOperators();
    setOperators(operatorsData);
    setFilteredOperators(operatorsData);
  };

  const handleAddOperator = async () => {
    if (!newOperator.name || !newOperator.code || !newOperator.role) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    try {
      await createOperator({
        name: newOperator.name,
        code: newOperator.code,
        role: newOperator.role,
        active: newOperator.active ?? true,
      });
      
      // Log de operador criado
      await logOperation('Admin', 'Sistema', `Operador ${newOperator.name} (${newOperator.code}) criado com role ${newOperator.role}`);
      
      await refreshOperators();
      setShowAddModal(null);
      setNewOperator({ name: '', code: '', role: undefined, active: true });
    } catch (error) {
      console.error('Erro ao adicionar operador:', error);
      
      // Log de erro ao criar operador
      await logError('Admin', 'Sistema', `Erro ao criar operador ${newOperator.name}: ${error}`);
      
      alert('Erro ao adicionar operador');
    }
  };

  const saveOperator = async (code: string) => {
    const operator = operators.find(op => op.code === code);
    if (!operator) return;
    try {
      await updateOperator(operator._id, editedOperatorData);
      await refreshOperators();
      setEditingOperator(null);
      setEditedOperatorData({});
    } catch (error) {
      alert('Erro ao salvar operador');
    }
  };

  const deleteOperatorHandler = async (code: string) => {
    const operator = operators.find(op => op.code === code);
    if (!operator) return;
    if (window.confirm('Tem certeza que deseja excluir este operador?')) {
      try {
        await deleteOperator(operator._id);
        
        // Log de operador deletado
        await logOperation('Admin', 'Sistema', `Operador ${operator.name} (${operator.code}) deletado`);
        
        await refreshOperators();
      } catch (error) {
        console.error('Erro ao remover operador:', error);
        
        // Log de erro ao deletar operador
        await logError('Admin', 'Sistema', `Erro ao deletar operador ${operator.name}: ${error}`);
        
        alert('Erro ao remover operador');
      }
    }
  };

  const handleOperatorChange = (field: keyof Operator, value: string) => {
    setEditedOperatorData(prev => ({ ...prev, [field]: value }));
  };

  // Funções para edição de máquinas
  const startEditingMachine = (machineId: string) => {
    const machine = machines.find(m => m.machineId === machineId);
    if (machine) {
      setEditingMachine(machineId);
      setEditedMachineData({ ...machine });
    }
  };

  const cancelEditingMachine = () => {
    setEditingMachine(null);
    setEditedMachineData({});
  };

  const saveMachine = async (machineId: string) => {
    const machine = machines.find(m => m.machineId === machineId);
    if (!machine) return;
    try {
      await updateMachine(machine._id, editedMachineData);
      await refreshMachines();
      setEditingMachine(null);
      setEditedMachineData({});
    } catch (error) {
      alert('Erro ao salvar máquina');
    }
  };

  const deleteMachineHandler = async (machineId: string) => {
    const machine = machines.find(m => m.machineId === machineId);
    if (!machine) return;
    if (window.confirm('Tem certeza que deseja excluir esta máquina?')) {
      try {
        await deleteMachine(machine._id);
        
        // Log de máquina deletada
        await logOperation('Admin', 'Sistema', `Máquina ${machine.name} (${machine.machineId}) deletada`);
        
        await refreshMachines();
      } catch (error) {
        console.error('Erro ao remover máquina:', error);
        
        // Log de erro ao deletar máquina
        await logError('Admin', 'Sistema', `Erro ao deletar máquina ${machine.name}: ${error}`);
        
        alert('Erro ao remover máquina');
      }
    }
  };

  const handleMachineChange = (field: keyof Machine, value: string) => {
    setEditedMachineData(prev => ({ ...prev, [field]: value }));
  };

  const refreshMachines = async () => {
    try {
      const machinesData = await getMachines();
      setMachines(machinesData);
      setFilteredMachines(machinesData);
    } catch (error) {
      console.error('Erro ao recarregar máquinas:', error);
    }
  };

  // Funções para adicionar novos itens
  const handleAddMachine = async () => {
    if (!newMachine.machineId || !newMachine.name || !newMachine.password) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await createMachine({
        machineId: newMachine.machineId,
        name: newMachine.name,
        password: newMachine.password,
        status: newMachine.status || 'active',
      });
      
      // Log de máquina criada
      await logOperation('Admin', 'Sistema', `Máquina ${newMachine.name} (${newMachine.machineId}) criada`);
      
      await refreshMachines();
      setShowAddModal(null);
      setNewMachine({
        machineId: '',
        name: '',
        password: '',
        status: 'active'
      });
    } catch (error) {
      console.error('Erro ao adicionar máquina:', error);
      
      // Log de erro ao criar máquina
      await logError('Admin', 'Sistema', `Erro ao criar máquina ${newMachine.name}: ${error}`);
      
      alert('Erro ao adicionar máquina');
    }
  };

  // Funções para edição de programas
  const startEditingProgram = (projectId: string) => {
    const program = programs.find(p => p.projectId === projectId);
    if (program) {
      setEditingProgram(projectId);
      setEditedProgramData({ ...program });
    }
  };

  const cancelEditingProgram = () => {
    setEditingProgram(null);
    setEditedProgramData({});
  };

  const saveProgram = async (projectId: string) => {
    const program = programs.find(p => p.projectId === projectId);
    if (!program) return;
    try {
      await updateProject(program._id, editedProgramData);
      await refreshPrograms();
      setEditingProgram(null);
      setEditedProgramData({});
    } catch (error) {
      alert('Erro ao salvar projeto');
    }
  };

  const deleteProgramHandler = async (projectId: string) => {
    const program = programs.find(p => p.projectId === projectId);
    if (!program) return;
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        await deleteProject(program._id);
        
        // Log de projeto deletado
        await logOperation('Admin', 'Sistema', `Projeto ${program.name} (${program.projectId}) deletado`);
        
        await refreshPrograms();
      } catch (error) {
        console.error('Erro ao remover projeto:', error);
        
        // Log de erro ao deletar projeto
        await logError('Admin', 'Sistema', `Erro ao deletar projeto ${program.name}: ${error}`);
        
        alert('Erro ao remover projeto');
      }
    }
  };

  const handleProgramChange = (field: keyof MoldProgram, value: any) => {
    setEditedProgramData(prev => ({ ...prev, [field]: value }));
  };

  const refreshPrograms = async () => {
    try {
      const projectsData = await getProjectsWithOperations();
      // Converter Project[] para MoldProgram[] adicionando operations
      const programsData = projectsData.map(project => ({
        ...project,
        operations: [] // Initialize with empty array
      }));
      setPrograms(programsData);
      setFilteredPrograms(programsData);
    } catch (error) {
      console.error('Erro ao recarregar projetos:', error);
    }
  };

  // Funções para adicionar novos itens
  const handleAddProgram = async () => {
    if (!newProgram.projectId || !newProgram.name || !newProgram.machine) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await createProject({
        projectId: newProgram.projectId,
        name: newProgram.name,
        machine: newProgram.machine,
        programPath: newProgram.programPath || `U:/${newProgram.machine}/${newProgram.projectId}`,
        material: newProgram.material || '',
        date: newProgram.date || new Date(),
        programmer: newProgram.programmer || '',
        blockCenter: newProgram.blockCenter || 'X0,0 Y0,0',
        reference: newProgram.reference || '',
        observations: newProgram.observations || '',
        imageUrl: newProgram.imageUrl || '/images/program-cover.jpg',
        status: newProgram.status || 'in_progress',
      });
      
      // Log de projeto criado
      await logOperation('Admin', 'Sistema', `Projeto ${newProgram.name} (${newProgram.projectId}) criado para máquina ${newProgram.machine}`);
      
      await refreshPrograms();
      setShowAddModal(null);
      setNewProgram({
        projectId: '',
        name: '',
        machine: '',
        programPath: '',
        material: '',
        date: new Date(),
        programmer: '',
        blockCenter: '',
        reference: '',
        observations: '',
        status: 'in_progress',
        operations: []
      });
    } catch (error) {
      console.error('Erro ao adicionar projeto:', error);
      
      // Log de erro ao criar projeto
      await logError('Admin', 'Sistema', `Erro ao criar projeto ${newProgram.name}: ${error}`);
      
      alert('Erro ao adicionar projeto');
    }
  };

  const handleDetailedEdit = (program: MoldProgram) => {
    setEditedProgramData(program);
    setShowDetailedEditModal(program._id);
  };

  const handleSaveDetailedEdit = async (updatedProgram: MoldProgram) => {
    try {
      await updateProject(updatedProgram._id, updatedProgram);
      await refreshPrograms();
      setShowDetailedEditModal(null);
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      alert('Erro ao salvar projeto');
    }
  };

  // Funções para gerenciar operações
  const handleAddOperation = (projectId: string) => {
    // TODO: Implementar modal para adicionar operação
    console.log('Adicionar operação ao projeto:', projectId);
  };

  const handleEditOperation = (projectId: string, operation: Operation) => {
    // TODO: Implementar modal para editar operação
    console.log('Editar operação:', operation, 'do projeto:', projectId);
  };

  const handleDeleteOperation = async (projectId: string, operationId: number | string) => {
    if (confirm('Tem certeza que deseja excluir esta operação?')) {
      try {
        // TODO: Implementar chamada para API para deletar operação
        console.log('Deletar operação:', operationId, 'do projeto:', projectId);
        await refreshPrograms();
      } catch (error) {
        console.error('Erro ao deletar operação:', error);
      }
    }
  };

  // Função para importar operações do CSV
  const handleImportOperations = async (operations: CsvOperation[]) => {
    try {
      const projectId = showImportModal;
      if (!projectId) return;

      const response = await fetch('/api/operations/bulk-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          operations
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao importar operações');
      }

      const result = await response.json();
      console.log('Operações importadas:', result);
      
      // Recarregar projetos para mostrar as novas operações
      await refreshPrograms();
      
      alert(`${result.insertedCount} operações importadas com sucesso!`);
    } catch (error) {
      console.error('Erro ao importar operações:', error);
      alert('Erro ao importar operações: ' + error);
    }
  };

  // Função para adicionar operação manualmente
  const handleAddManualOperation = async (projectId: string) => {
    if (!newOperation.type && !newOperation.toolRef && !newOperation.notes) {
      alert('Preencha pelo menos um campo para adicionar a operação.');
      return;
    }
    try {
      const op = {
        ...newOperation,
        id: Date.now(),
        createdAt: new Date(),
        updatedAt: new Date(),
        completed: false,
      };
      const response = await fetch('/api/operations/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, operations: [op] }),
      });
      if (!response.ok) throw new Error('Erro ao adicionar operação');
      setNewOperation({ id: Date.now() });
      await refreshPrograms();
    } catch (error) {
      alert('Erro ao adicionar operação: ' + error);
    }
  };

  // Função para editar operação
  const handleEditManualOperation = (projectId: string, operation: ManualOperation) => {
    setEditingOperation(operation);
    setEditingProjectId(projectId);
  };

  // Função para salvar edição
  const handleSaveEditOperation = async () => {
    if (!editingOperation || !editingProjectId) return;
    try {
      const op = {
        ...editingOperation,
        updatedAt: new Date(),
      };
      // Atualizar operação (simples: deletar e adicionar de novo)
      await handleDeleteOperation(editingProjectId, editingOperation.id);
      const response = await fetch('/api/operations/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: editingProjectId, operations: [op] }),
      });
      if (!response.ok) throw new Error('Erro ao salvar edição');
      setEditingOperation(null);
      setEditingProjectId(null);
      await refreshPrograms();
    } catch (error) {
      alert('Erro ao salvar edição: ' + error);
    }
  };

  // Função para cancelar edição
  const handleCancelEditOperation = () => {
    setEditingOperation(null);
    setEditingProjectId(null);
  };

  // Função para salvar operação
  const handleSaveOperation = async (projectId: string, op: any) => {
    try {
      const response = await fetch('/api/operations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, operation: op }),
      });
      if (!response.ok) throw new Error('Erro ao criar operação');
      setShowOperationModal(null);
      await refreshPrograms();
    } catch (error) {
      alert('Erro ao criar operação: ' + error);
    }
  };

  const renderProgramsTab = () => {
    return (
      <div className="space-y-4">
        <div className="grid gap-4">
          {filteredPrograms.map((program) => (
            <div key={program._id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{program.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      program.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {program.status === 'completed' ? 'Concluído' : 'Em Andamento'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">ID do Projeto:</span> {program.projectId}
                    </div>
                    <div>
                      <span className="font-medium">Máquina:</span> {program.machine}
                    </div>
                    <div>
                      <span className="font-medium">Material:</span> {program.material || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Programador:</span> {program.programmer || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Data:</span> {new Date(program.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div>
                      <span className="font-medium">Caminho:</span> {program.programPath || 'N/A'}
                    </div>
                  </div>
                  
                  {program.observations && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-700">Observações:</span>
                      <p className="text-gray-600 mt-1">{program.observations}</p>
                    </div>
                  )}

                  {program.operations && program.operations.length > 0 && (
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium text-gray-900">Operações</h4>
                        <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => setShowOperationModal(program.projectId)}>Adicionar Operação</button>
                      </div>
                      {/* Modal de operação */}
                      {showOperationModal === program.projectId && (
                        <OperationModal
                          isOpen={true}
                          onClose={() => setShowOperationModal(null)}
                          onSave={op => handleSaveOperation(program.projectId, op)}
                        />
                      )}
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-50 border border-gray-200 rounded-lg">
                          <thead>
                            <tr>
                              {csvFields.map(field => (
                                <th key={field} className="px-3 py-2 border-b text-left text-sm font-medium">{field}</th>
                              ))}
                              <th className="px-3 py-2 border-b text-left text-sm font-medium">Status</th>
                              <th className="px-3 py-2 border-b text-left text-sm font-medium">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {program.operations.map((op, idx) => (
                              <tr key={(op.sequence || idx) + '-' + idx} className="border-b hover:bg-gray-100">
                                {csvFields.map(field => (
                                  <td key={field} className="px-3 py-2 text-sm">{(op as any)[field] || ''}</td>
                                ))}
                                <td className="px-3 py-2 text-sm">
                                  <span className={`px-2 py-1 text-xs rounded-full ${op.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{op.completed ? 'Concluída' : 'Pendente'}</span>
                                </td>
                                <td className="px-3 py-2 text-sm flex gap-1">
                                  <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs" onClick={() => setShowOperationModal(program.projectId + '-' + (op.id || idx))}>Editar</button>
                                  <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs" onClick={() => handleDeleteOperation(program.projectId, op.id)}>Excluir</button>
                                </td>
                                {/* Modal de edição para cada operação */}
                                {showOperationModal === program.projectId + '-' + (op.id || idx) && (
                                  <OperationModal
                                    isOpen={true}
                                    onClose={() => setShowOperationModal(null)}
                                    onSave={updatedOp => handleSaveOperation(program.projectId, { ...op, ...updatedOp })}
                                    initialOperation={op}
                                  />
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleDetailedEdit(program)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar projeto"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteProgramHandler(program.projectId)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir projeto"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredPrograms.length === 0 && (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto encontrado</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Tente ajustar os termos de pesquisa.' : 'Comece adicionando um novo projeto.'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const startEditingOperator = (code: string) => {
    const operator = operators.find(op => op.code === code);
    if (operator) {
      setEditingOperator(code);
      setEditedOperatorData({ ...operator });
    }
  };

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
              <button
                onClick={() => setActiveTab('importpdf')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'importpdf'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-5 w-5 inline-block mr-2" />
                Importar Projeto (PDF)
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
                <button 
                  onClick={() => handleRefresh()}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOperators.map((operator) => (
                      <tr key={operator._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{operator.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{operator.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{operator.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{operator.active ? 'Ativo' : 'Inativo'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {editingOperator === operator.code ? (
                              <>
                                <button 
                                  onClick={() => saveOperator(operator.code)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <Check className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => deleteOperatorHandler(operator.code)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => startEditingOperator(operator.code)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => deleteOperatorHandler(operator.code)}
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
                        Última Manutenção
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMachines.map((machine) => (
                      <tr key={machine.machineId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {editingMachine === machine.machineId ? (
                            <input
                              type="text"
                              value={editedMachineData.machineId || ''}
                              onChange={(e) => handleMachineChange('machineId', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            machine.machineId
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingMachine === machine.machineId ? (
                            <input
                              type="text"
                              value={editedMachineData.name || ''}
                              onChange={(e) => handleMachineChange('name', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            machine.name
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingMachine === machine.machineId ? (
                            <select
                              value={editedMachineData.status || ''}
                              onChange={(e) => handleMachineChange('status', e.target.value as 'active' | 'maintenance' | 'inactive')}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            >
                              <option value="active">Ativo</option>
                              <option value="maintenance">Manutenção</option>
                              <option value="inactive">Inativo</option>
                            </select>
                          ) : (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              machine.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : machine.status === 'maintenance'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {machine.lastLogin ? new Date(machine.lastLogin).toLocaleDateString('pt-BR') : 'Nunca'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {editingMachine === machine.machineId ? (
                              <>
                                <button 
                                  onClick={() => saveMachine(machine.machineId)}
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
                                  onClick={() => startEditingMachine(machine.machineId)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => deleteMachineHandler(machine.machineId)}
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

            {/* Aba de Logs */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                {/* Filtros de Logs */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Filtros de Logs</h3>
                    <button
                      onClick={() => setShowLogFilters(!showLogFilters)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      <Filter className="h-4 w-4" />
                      {showLogFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                    </button>
                  </div>
                  
                  {showLogFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                          value={logFilters.type || ''}
                          onChange={(e) => setLogFilters({ ...logFilters, type: e.target.value || undefined })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        >
                          <option value="">Todos os tipos</option>
                          <option value="Login">Login</option>
                          <option value="Operação">Operação</option>
                          <option value="Erro">Erro</option>
                          <option value="Manutenção">Manutenção</option>
                          <option value="Sistema">Sistema</option>
                          <option value="Segurança">Segurança</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                        <input
                          type="text"
                          value={logFilters.user || ''}
                          onChange={(e) => setLogFilters({ ...logFilters, user: e.target.value || undefined })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                          placeholder="Filtrar por usuário"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Máquina</label>
                        <input
                          type="text"
                          value={logFilters.machine || ''}
                          onChange={(e) => setLogFilters({ ...logFilters, machine: e.target.value || undefined })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                          placeholder="Filtrar por máquina"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                        <input
                          type="date"
                          value={logFilters.startDate || ''}
                          onChange={(e) => setLogFilters({ ...logFilters, startDate: e.target.value || undefined })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={applyLogFilters}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                    >
                      Aplicar Filtros
                    </button>
                    <button
                      onClick={resetLogFilters}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Limpar Filtros
                    </button>
                    <button
                      onClick={clearOldLogsHandler}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      Limpar Logs Antigos
                    </button>
                    <button
                      onClick={() => {
                        // Função para exportar logs (implementar depois)
                        alert('Funcionalidade de exportação será implementada em breve');
                      }}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                    >
                      <Download className="h-4 w-4 inline mr-2" />
                      Exportar
                    </button>
                  </div>
                </div>

                {/* Tabela de Logs */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
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
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLogs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                              Nenhum log encontrado
                            </td>
                          </tr>
                        ) : (
                          filteredLogs.map((log) => (
                            <tr key={log._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  log.type === 'Erro' 
                                    ? 'bg-red-100 text-red-800' 
                                    : log.type === 'Manutenção'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : log.type === 'Login'
                                        ? 'bg-blue-100 text-blue-800'
                                        : log.type === 'Operação'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {log.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{log.user}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{log.machine}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-xs truncate" title={log.details}>
                                  {log.details}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => deleteLogHandler(log._id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Deletar log"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredLogs.length > 0 && (
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                      <div className="text-sm text-gray-700">
                        Mostrando {filteredLogs.length} de {logs.length} logs
                      </div>
                    </div>
                  )}
                </div>
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
              </div>
            )}

            {activeTab === 'importpdf' && (
              <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow space-y-4">
                <h2 className="text-xl font-bold mb-2">Importar Projeto via PDF</h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setPdfJsonLoading(true);
                    setPdfJsonError('');
                    setPdfJsonResult(null);
                    const formData = new FormData();
                    if (!pdfFile) {
                      setPdfJsonError('Selecione um arquivo PDF.');
                      setPdfJsonLoading(false);
                      return;
                    }
                    formData.append('file', pdfFile);
                    // Enviar a máquina logada, se disponível
                    if (typeof machineId === 'string' && machineId) {
                      formData.append('machine', machineId);
                    }
                    try {
                      const res = await fetch('/api/projects/import-pdf-project', {
                        method: 'POST',
                        body: formData
                      });
                      if (!res.ok) {
                        let errorMsg = await res.text();
                        try { errorMsg = JSON.parse(errorMsg).error || errorMsg; } catch {}
                        setPdfJsonError('Erro ao importar PDF: ' + errorMsg);
                        // Logar erro no backend
                        await fetch('/api/logs', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            type: 'Erro',
                            user: 'Admin',
                            machine: 'Painel',
                            details: 'Erro ao importar PDF: ' + errorMsg,
                            timestamp: new Date().toISOString()
                          })
                        });
                        setPdfJsonLoading(false);
                        return;
                      }
                      const json = await res.json();
                      setPdfJsonResult(json);
                      // Atualizar lista de projetos após importação
                      await handleRefresh();
                    } catch (err) {
                      setPdfJsonError('Erro ao importar PDF: ' + err);
                    } finally {
                      setPdfJsonLoading(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={e => setPdfFile(e.target.files?.[0] || null)}
                    className="block w-full border rounded p-2"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                    disabled={pdfJsonLoading}
                  >
                    {pdfJsonLoading ? 'Importando...' : 'Importar PDF'}
                  </button>
                </form>
                {pdfJsonError && <div className="text-red-600">{pdfJsonError}</div>}
                {pdfJsonResult && (
                  <div className="bg-green-100 text-green-800 p-3 rounded">
                    Projeto importado com sucesso!<br/>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-60">{JSON.stringify(pdfJsonResult.projeto, null, 2)}</pre>
                    <b>Operações importadas:</b> {pdfJsonResult.operacoes?.length || 0}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de importação */}
      {showImportModal && (
        <OperationImportModal
          isOpen={!!showImportModal}
          onClose={() => setShowImportModal(null)}
          onImport={handleImportOperations}
          projectId={showImportModal}
        />
      )}
    </div>
  );
}

