import { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';

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

interface ProgramEditModalProps {
  program: MoldProgram;
  onClose: () => void;
  onSave: (updatedProgram: MoldProgram) => void;
}

export function ProgramEditModal({ program, onClose, onSave }: ProgramEditModalProps) {
  const [editedProgram, setEditedProgram] = useState<MoldProgram>({ 
    ...program,
    operations: program.operations || []
  });

  const handleProgramChange = (field: keyof MoldProgram, value: any) => {
    setEditedProgram(prev => ({ ...prev, [field]: value }));
  };

  const handleOperationChange = (operationIndex: number, field: string, value: any) => {
    setEditedProgram(prev => {
      const newOperations = [...(prev.operations || [])];
      if (field.includes('.')) {
        const [category, subField] = field.split('.');
        const currentOperation = newOperations[operationIndex];
        const categoryValue = currentOperation[category as keyof Operation] as Record<string, any>;
        
        newOperations[operationIndex] = {
          ...currentOperation,
          [category]: {
            ...categoryValue,
            [subField]: value
          }
        };
      } else {
        newOperations[operationIndex] = {
          ...newOperations[operationIndex],
          [field]: value
        };
      }
      return { ...prev, operations: newOperations };
    });
  };

  const addOperation = () => {
    const newOperation: Operation = {
      id: (editedProgram.operations?.length || 0) + 1,
      sequence: '',
      type: '',
      function: '',
      centerPoint: '',
      toolRef: '',
      ic: '',
      alt: '',
      time: {
        machine: '',
        total: ''
      },
      details: {
        depth: '',
        speed: '',
        feed: '',
        coolant: '',
        notes: ''
      },
      quality: {
        tolerance: '',
        surfaceFinish: '',
        requirements: []
      }
    };
    setEditedProgram(prev => ({
      ...prev,
      operations: [...(prev.operations || []), newOperation]
    }));
  };

  const removeOperation = (index: number) => {
    setEditedProgram(prev => ({
      ...prev,
      operations: (prev.operations || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onSave(editedProgram);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Editar Programa: {program.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Informações Básicas do Programa */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Programa</label>
            <input
              type="text"
              value={editedProgram.name}
              onChange={(e) => handleProgramChange('name', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Máquina</label>
            <input
              type="text"
              value={editedProgram.machine}
              onChange={(e) => handleProgramChange('machine', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Caminho do Programa</label>
            <input
              type="text"
              value={editedProgram.programPath}
              onChange={(e) => handleProgramChange('programPath', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Material</label>
            <input
              type="text"
              value={editedProgram.material}
              onChange={(e) => handleProgramChange('material', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <input
              type="text"
              value={editedProgram.date instanceof Date ? editedProgram.date.toLocaleDateString('pt-BR') : editedProgram.date}
              onChange={(e) => handleProgramChange('date', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Programador</label>
            <input
              type="text"
              value={editedProgram.programmer}
              onChange={(e) => handleProgramChange('programmer', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Operações */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Operações</h3>
            <button
              onClick={addOperation}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              Adicionar Operação
            </button>
          </div>

          {(editedProgram.operations || []).map((operation, index) => (
            <div key={operation.id} className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">Operação #{operation.sequence}</h4>
                <button
                  onClick={() => removeOperation(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sequência</label>
                  <input
                    type="text"
                    value={operation.sequence}
                    onChange={(e) => handleOperationChange(index, 'sequence', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <input
                    type="text"
                    value={operation.type}
                    onChange={(e) => handleOperationChange(index, 'type', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Função</label>
                  <input
                    type="text"
                    value={operation.function}
                    onChange={(e) => handleOperationChange(index, 'function', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ponto Central</label>
                  <input
                    type="text"
                    value={operation.centerPoint}
                    onChange={(e) => handleOperationChange(index, 'centerPoint', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Referência da Ferramenta</label>
                  <input
                    type="text"
                    value={operation.toolRef}
                    onChange={(e) => handleOperationChange(index, 'toolRef', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">IC</label>
                  <input
                    type="text"
                    value={operation.ic}
                    onChange={(e) => handleOperationChange(index, 'ic', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>

                {/* Detalhes da Operação */}
                <div className="col-span-3">
                  <h5 className="font-medium mb-2">Detalhes</h5>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Profundidade</label>
                      <input
                        type="text"
                        value={operation.details.depth}
                        onChange={(e) => handleOperationChange(index, 'details.depth', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Velocidade</label>
                      <input
                        type="text"
                        value={operation.details.speed}
                        onChange={(e) => handleOperationChange(index, 'details.speed', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Avanço</label>
                      <input
                        type="text"
                        value={operation.details.feed}
                        onChange={(e) => handleOperationChange(index, 'details.feed', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Refrigeração</label>
                      <input
                        type="text"
                        value={operation.details.coolant}
                        onChange={(e) => handleOperationChange(index, 'details.coolant', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Qualidade */}
                {operation.quality && (
                  <div className="col-span-3">
                    <h5 className="font-medium mb-2">Qualidade</h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Tolerância</label>
                        <input
                          type="text"
                          value={operation.quality.tolerance}
                          onChange={(e) => handleOperationChange(index, 'quality.tolerance', e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Acabamento Superficial</label>
                        <input
                          type="text"
                          value={operation.quality.surfaceFinish}
                          onChange={(e) => handleOperationChange(index, 'quality.surfaceFinish', e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
} 