import React, { useState, useEffect, useRef } from 'react';
import { searchOperators, Operator } from '../services/operatorService';

interface SimpleSignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    operatorName: string;
    startTime: string;
    endTime: string;
    measurement: string;
    notes?: string;
  }) => void;
}

export const SimpleSignModal: React.FC<SimpleSignModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [operatorQuery, setOperatorQuery] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [operatorSuggestions, setOperatorSuggestions] = useState<Operator[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [measurement, setMeasurement] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (operatorQuery.trim().length > 0) {
      searchOperators(operatorQuery).then(setOperatorSuggestions);
      setShowSuggestions(true);
    } else {
      setOperatorSuggestions([]);
      setShowSuggestions(false);
    }
  }, [operatorQuery]);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleOperatorSelect = (operator: Operator) => {
    setSelectedOperator(operator);
    setOperatorQuery(`${operator.code} - ${operator.name}`);
    setShowSuggestions(false);
  };

  const handleOperatorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOperatorQuery(e.target.value);
    setSelectedOperator(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOperator) {
      alert('Por favor, selecione um operador válido.');
      return;
    }
    setIsSubmitting(true);
    onConfirm({ 
      operatorName: `${selectedOperator.code} - ${selectedOperator.name}`,
      startTime, endTime, measurement, notes 
    });
    setIsSubmitting(false);
    setOperatorQuery('');
    setSelectedOperator(null);
    setStartTime('');
    setEndTime('');
    setMeasurement('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Assinar Operação</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative" ref={suggestionsRef}>
            <label className="block text-sm font-medium mb-1">Operador</label>
            <input
              type="text"
              value={operatorQuery}
              onChange={handleOperatorInputChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Digite código ou nome"
              required
              autoComplete="off"
              onFocus={() => operatorQuery && setShowSuggestions(true)}
            />
            {showSuggestions && operatorSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                {operatorSuggestions.map((operator) => (
                  <div
                    key={operator._id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleOperatorSelect(operator)}
                  >
                    <div className="font-medium">{operator.code} - {operator.name}</div>
                    <div className="text-sm text-gray-500">{operator.role}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Horário Início</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Horário Término</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Medição (mm)</label>
            <input
              type="text"
              value={measurement}
              onChange={e => setMeasurement(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border rounded bg-green-600 text-white hover:bg-green-700"
              disabled={isSubmitting || !selectedOperator}
            >
              {isSubmitting ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 