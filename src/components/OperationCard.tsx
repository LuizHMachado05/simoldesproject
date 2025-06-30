import React, { useState, useEffect } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, PenTool, Eye } from 'lucide-react';
import { OperationActions } from './OperationActions';
import { updateOperation, signOperation } from '../services/operationService';
import { getOperators, Operator, authenticateOperator } from '../services/operatorService';
import { PasswordSignModal } from './PasswordSignModal';

interface OperationCardProps {
  operation: any;
  expanded: boolean;
  onExpand: () => void;
  onSign: () => void;
  onView: () => void;
  projectId?: string;
}

function formatDateTime(date: string | Date | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export const OperationCard: React.FC<OperationCardProps> = ({ operation, expanded, onExpand, onSign, onView, projectId }) => {
  const mainColor = '#04514B';
  // Estados locais para edição dos campos
  const [operator, setOperator] = useState(operation.signedBy || '');
  const [startTime, setStartTime] = useState(operation.timeRecord?.start || '');
  const [endTime, setEndTime] = useState(operation.timeRecord?.end || '');
  const [measurement, setMeasurement] = useState(operation.measurementValue || '');
  const [notes, setNotes] = useState(operation.inspectionNotes || '');
  // Estados de loading/sucesso
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [operatorSuggestions, setOperatorSuggestions] = useState<Operator[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Estados para o modal de senha
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (operator.trim().length > 0) {
      getOperators().then((ops: Operator[]) => {
        const filtered = ops.filter(op =>
          (op.name && op.name.toLowerCase().includes(operator.toLowerCase())) ||
          (op.matricula && op.matricula.toLowerCase().includes(operator.toLowerCase()))
        );
        setOperatorSuggestions(filtered);
        setShowSuggestions(true);
      });
    } else {
      setOperatorSuggestions([]);
      setShowSuggestions(false);
    }
  }, [operator]);

  const handleOperatorSelect = (op: Operator) => {
    setOperator(op.matricula ? `${op.matricula} - ${op.name}` : op.name);
    setShowSuggestions(false);
  };

  // Verifica se houve alteração em algum campo
  const isDirty =
    operator !== (operation.signedBy || '') ||
    startTime !== (operation.timeRecord?.start || '') ||
    endTime !== (operation.timeRecord?.end || '') ||
    measurement !== (operation.measurementValue || '') ||
    notes !== (operation.inspectionNotes || '');

  // Função real para salvar todos os campos
  const saveAllFields = async () => {
    if (!projectId) {
      console.error('ProjectId não fornecido para atualização da operação');
      alert('Erro: ID do projeto não encontrado');
      return;
    }

    // Verificar se todos os campos obrigatórios estão preenchidos
    if (!operator.trim() || !startTime || !endTime || !measurement.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios (operador, horários e medição)');
      return;
    }

    // Abrir modal de senha para validação
    setShowPasswordModal(true);
  };

  // Função para confirmar assinatura após validação de senha
  const handlePasswordConfirm = async (authenticatedOperator: Operator) => {
    setSaving(true);
    setSuccess(false);
    
    try {
      // Chama signOperation para assinar a operação
      const result = await signOperation({
        projectId: projectId!,
        operationId: operation.id !== undefined ? operation.id : operation.sequence,
        operatorName: operator,
        startTime: startTime,
        endTime: endTime,
        measurement: measurement,
        notes: notes
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 1200);
        // Marca a operação como assinada localmente
        if (typeof operation === 'object') {
          operation.completed = true;
          operation.signedBy = operator;
          operation.timeRecord = { start: startTime, end: endTime };
          operation.measurementValue = measurement;
          operation.inspectionNotes = notes;
        }
      } else {
        alert('Erro ao assinar operação: ' + result.message);
      }
    } catch (error) {
      console.error('Erro ao assinar operação:', error);
      alert('Erro ao assinar operação. Tente novamente.');
    } finally {
      setSaving(false);
      setShowPasswordModal(false);
    }
  };

  return (
    <div
      className={`relative group rounded-2xl shadow-xl border-0 bg-gradient-to-br from-white via-[#f3f4f6] to-[#e6f4f1] overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-2xl`}
      style={{ borderLeft: `8px solid ${operation.completed ? '#22c55e' : mainColor}`, pointerEvents: 'auto' }}
    >
      {/* Badge de status */}
      <div className="absolute top-4 right-4 z-10">
        {operation.completed ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 shadow">
            <CheckCircle2 className="h-4 w-4" /> Assinado
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 shadow">
            <PenTool className="h-4 w-4" /> Pendente
          </span>
        )}
      </div>
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 px-6 pt-6 pb-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Operação #{operation.sequence}</span>
          <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {operation.type} <span className="text-base font-normal text-gray-500">({operation.function})</span>
          </span>
          <span className="text-xs text-gray-500">Ferramenta: <span className="font-semibold text-gray-700">{operation.toolRef}</span></span>
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <button
            onClick={onExpand}
            className="rounded-full p-2 bg-gray-100 hover:bg-[#04514B] hover:text-white transition-colors border border-gray-200 shadow"
            aria-label={expanded ? 'Recolher' : 'Expandir'}
          >
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {/* Conteúdo expandido */}
      {expanded && (
        <div className="px-6 pb-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in" style={{ pointerEvents: 'auto' }}>
          {/* Coluna esquerda: detalhes */}
          <div className="space-y-6" style={{ pointerEvents: 'auto' }}>
            {/* Campos de edição inline para assinatura */}
            <div className="space-y-4 mb-4">
              {/* Operador */}
              <div style={{ position: 'relative' }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operador</label>
                <input
                  type="text"
                  value={operator}
                  onChange={e => setOperator(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Nome ou matrícula do operador"
                  onFocus={() => operator && setShowSuggestions(true)}
                />
                {showSuggestions && operatorSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                    {operatorSuggestions.map((op) => (
                      <div
                        key={op._id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleOperatorSelect(op)}
                      >
                        <div className="font-medium">{op.matricula ? `${op.matricula} - ` : ''}{op.name}</div>
                        <div className="text-sm text-gray-500">{op.role}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Horário Início */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horário Início</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              {/* Horário Término */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horário Término</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              {/* Medição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medição (mm)</label>
                <input
                  type="text"
                  value={measurement}
                  onChange={e => setMeasurement(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ex: 12.45"
                />
              </div>
              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                />
              </div>
              {/* Botão único de salvar alterações */}
              {isDirty && (
                <button
                  className="mt-2 w-full px-6 py-3 rounded-xl bg-[#04514B] text-white font-bold text-base shadow-lg hover:bg-[#057c6b] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={saving}
                  onClick={saveAllFields}
                >
                  <PenTool className="h-5 w-5" />
                  {saving ? 'Salvando...' : success ? 'Salvo!' : 'Assinar Operação'}
                </button>
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#04514B] mb-2">Detalhes</h4>
              <dl className="divide-y divide-gray-100 bg-white/60 rounded-lg p-3 shadow-sm">
                <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Profundidade</dt><dd className="text-gray-900 font-semibold">{operation.details.depth}</dd></div>
                <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Velocidade</dt><dd className="text-gray-900 font-semibold">{operation.details.speed}</dd></div>
                <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Avanço</dt><dd className="text-gray-900 font-semibold">{operation.details.feed}</dd></div>
                <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Refrigeração</dt><dd className="text-gray-900 font-semibold">{operation.details.coolant}</dd></div>
                {operation.details.notes && <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Notas</dt><dd className="text-gray-900 font-semibold">{operation.details.notes}</dd></div>}
              </dl>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#04514B] mb-2">Qualidade</h4>
              <dl className="divide-y divide-gray-100 bg-white/60 rounded-lg p-3 shadow-sm">
                <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Tolerância</dt><dd className="text-gray-900 font-semibold">{operation.quality.tolerance}</dd></div>
                <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Acabamento</dt><dd className="text-gray-900 font-semibold">{operation.quality.surfaceFinish}</dd></div>
              </dl>
            </div>
          </div>
          {/* Coluna direita: status, imagem, detalhes */}
          <div className="space-y-6">
            {operation.completed && (
              <div className="bg-green-50 p-4 rounded-xl shadow-sm">
                <h4 className="text-sm font-bold text-[#04514B] mb-2">Detalhes da Conclusão</h4>
                <dl className="divide-y divide-gray-100">
                  <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Assinado por</dt><dd className="text-gray-900 font-semibold">{operation.signedBy}</dd></div>
                  <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Data/Hora</dt><dd className="text-gray-900 font-semibold">{formatDateTime(operation.timestamp)}</dd></div>
                  {operation.timeRecord && <>
                    <div className="grid grid-cols-2 py-1">
                      <dt className="text-gray-500">Início</dt>
                      <dd className="text-gray-900 font-semibold">{formatDateTime(operation.timeRecord.start)}</dd>
                    </div>
                    <div className="grid grid-cols-2 py-1">
                      <dt className="text-gray-500">Término</dt>
                      <dd className="text-gray-900 font-semibold">{formatDateTime(operation.timeRecord.end)}</dd>
                    </div>
                  </>}
                  {operation.measurementValue && <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Medição</dt><dd className="text-gray-900 font-semibold">{operation.measurementValue} mm</dd></div>}
                  {operation.inspectionNotes && <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Observações</dt><dd className="text-gray-900 font-semibold">{operation.inspectionNotes}</dd></div>}
                </dl>
              </div>
            )}
            <button
              onClick={onView}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-[#04514B] text-[#04514B] font-bold text-base shadow hover:bg-[#04514B] hover:text-white transition-colors"
            >
              <Eye className="h-5 w-5" /> Visualizar Detalhes
            </button>
            <div className="bg-white/80 p-4 rounded-xl shadow-sm flex flex-col items-center">
              <h4 className="text-sm font-bold text-[#04514B] mb-2">Visualização 2D</h4>
              <div className="relative w-full h-0 pb-[60%] rounded overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <img
                    src={operation.imageUrl || `${import.meta.env.BASE_URL}2d.png`}
                    alt={operation.name || 'Operação'}
                    className="max-w-[90%] max-h-[90%] object-contain drop-shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de senha para validação */}
      {showPasswordModal && (
        <PasswordSignModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onConfirm={handlePasswordConfirm}
          operationData={{
            operatorName: operator,
            startTime: startTime,
            endTime: endTime,
            measurement: measurement,
            notes: notes
          }}
        />
      )}
    </div>
  );
}; 