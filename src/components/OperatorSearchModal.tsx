import * as Dialog from '@radix-ui/react-dialog';
import { X, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import operatorsData from '../data/operators.json';

interface Operator {
  matricula: string;
  nome: string;
  cargo: string;
  turno: string;
}

interface OperatorSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    startTime: string;
    endTime: string;
    measurement: string;
    operatorName: string;
    notes?: string;
  }) => void;
}

export function OperatorSearchModal({ isOpen, onClose, onConfirm }: OperatorSearchModalProps) {
  const [operatorQuery, setOperatorQuery] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Função para buscar operadores
  const searchOperators = (query: string): Operator[] => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    
    return operatorsData.filter(
      (operator) => 
        operator.matricula.includes(lowerQuery) || 
        operator.nome.toLowerCase().includes(lowerQuery)
    );
  };

  useEffect(() => {
    if (operatorQuery.trim()) {
      const results = searchOperators(operatorQuery);
      setOperators(results);
      setIsDropdownOpen(results.length > 0);
    } else {
      setOperators([]);
      setIsDropdownOpen(false);
    }
  }, [operatorQuery]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOperatorSelect = (operator: Operator) => {
    setSelectedOperator(operator);
    setOperatorQuery(`${operator.matricula} - ${operator.nome}`);
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!selectedOperator) {
      alert('Por favor, selecione um operador válido');
      return;
    }
    
    onConfirm({
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      measurement: formData.get('measurement') as string,
      operatorName: `${selectedOperator.matricula} - ${selectedOperator.nome}`,
      notes: formData.get('notes') as string,
    });
    
    // Limpa os campos após envio
    setOperatorQuery('');
    setSelectedOperator(null);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            Assinar Operação
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo de busca de operador */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium mb-1">
                Operador
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={operatorQuery}
                  onChange={(e) => setOperatorQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded border border-gray-300 shadow-sm"
                  placeholder="Digite matrícula ou nome"
                  autoComplete="off"
                />
              </div>
              
              {/* Dropdown de resultados */}
              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {operators.map((operator) => (
                    <div
                      key={operator.matricula}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleOperatorSelect(operator)}
                    >
                      <div className="font-medium">{operator.matricula} - {operator.nome}</div>
                      <div className="text-sm text-gray-500">{operator.cargo} • {operator.turno}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Horário Início
                </label>
                <input
                  type="time"
                  name="startTime"
                  required
                  className="w-full rounded border border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Horário Término
                </label>
                <input
                  type="time"
                  name="endTime"
                  required
                  className="w-full rounded border border-gray-300 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Medição (mm)
              </label>
              <input
                type="text"
                name="measurement"
                required
                className="w-full rounded border border-gray-300 shadow-sm"
                placeholder="Ex: 12.45"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Observações
              </label>
              <textarea
                name="notes"
                rows={2}
                className="w-full rounded border border-gray-300 shadow-sm"
                placeholder="Observações adicionais (opcional)"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#04514B] hover:bg-[#033b36]"
              >
                Confirmar
              </button>
            </div>
          </form>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
