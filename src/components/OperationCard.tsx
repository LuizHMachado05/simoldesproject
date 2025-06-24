import React from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, PenTool, Eye } from 'lucide-react';
import { OperationActions } from './OperationActions';

interface OperationCardProps {
  operation: any;
  expanded: boolean;
  onExpand: () => void;
  onSign: () => void;
  onView: () => void;
}

export const OperationCard: React.FC<OperationCardProps> = ({ operation, expanded, onExpand, onSign, onView }) => {
  const mainColor = '#04514B';
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
            <div>
              <h4 className="text-sm font-bold text-[#04514B] mb-2">Parâmetros</h4>
              <dl className="divide-y divide-gray-100 bg-white/60 rounded-lg p-3 shadow-sm">
                <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Centro</dt><dd className="text-gray-900 font-semibold">{operation.centerPoint}</dd></div>
                <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">IC</dt><dd className="text-gray-900 font-semibold">{operation.ic}</dd></div>
                <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">ALT</dt><dd className="text-gray-900 font-semibold">{operation.alt}</dd></div>
              </dl>
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
            {/* Botão de assinar */}
            {!operation.completed && (
              <div style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
                <button
                  onClick={() => {
                    console.log('[DEBUG] Botão de assinatura clicado para operação:', operation.id);
                    console.log('[DEBUG] operation.completed:', operation.completed);
                    onSign();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#04514B] text-white font-bold text-base shadow-lg hover:bg-[#057c6b] transition-colors mt-4 cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  <PenTool className="h-5 w-5" /> Assinar Operação
                </button>
              </div>
            )}
          </div>
          {/* Coluna direita: status, imagem, detalhes */}
          <div className="space-y-6">
            {operation.completed && (
              <div className="bg-green-50 p-4 rounded-xl shadow-sm">
                <h4 className="text-sm font-bold text-[#04514B] mb-2">Detalhes da Conclusão</h4>
                <dl className="divide-y divide-gray-100">
                  <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Assinado por</dt><dd className="text-gray-900 font-semibold">{operation.signedBy}</dd></div>
                  <div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Data/Hora</dt><dd className="text-gray-900 font-semibold">{operation.timestamp}</dd></div>
                  {operation.timeRecord && <><div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Início</dt><dd className="text-gray-900 font-semibold">{operation.timeRecord.start}</dd></div><div className="grid grid-cols-2 py-1"><dt className="text-gray-500">Término</dt><dd className="text-gray-900 font-semibold">{operation.timeRecord.end}</dd></div></>}
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
    </div>
  );
}; 