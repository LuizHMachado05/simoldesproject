import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { getOperators, Operator } from '../services/operatorService';

interface OperatorSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (operator: Operator) => void;
}

export function OperatorSearchModal({ isOpen, onClose, onSelect }: OperatorSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [operators, setOperators] = useState<Operator[]>([]);
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOperators();
    }
  }, [isOpen]);

  const loadOperators = async () => {
    try {
      setIsLoading(true);
      const data = await getOperators();
      setOperators(data);
      setFilteredOperators(data);
    } catch (error) {
      console.error('Erro ao carregar operadores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = operators.filter(operator =>
        operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operator.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOperators(filtered);
    } else {
      setFilteredOperators(operators);
    }
  }, [searchTerm, operators]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Selecionar Operador</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar operador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            {filteredOperators.length > 0 ? (
              filteredOperators.map((operator) => (
                <button
                  key={operator._id}
                  onClick={() => {
                    onSelect(operator);
                    onClose();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg mb-1"
                >
                  <div className="font-medium">{operator.name}</div>
                  <div className="text-sm text-gray-500">Código: {operator.code}</div>
                </button>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                Nenhum operador encontrado
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
