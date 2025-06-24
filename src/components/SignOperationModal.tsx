import { X, Search, User, RefreshCw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { searchOperators, Operator } from '../services/operatorService';

interface SignOperationModalProps {
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

export function SignOperationModal({ isOpen, onClose, onConfirm }: SignOperationModalProps) {
  console.log('[DEBUG] SignOperationModal renderizado, isOpen:', isOpen);
  console.log('[DEBUG] SignOperationModal - isOpen type:', typeof isOpen);
  console.log('[DEBUG] SignOperationModal - isOpen value:', isOpen);
  
  const [operatorQuery, setOperatorQuery] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOperatorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOperatorQuery(e.target.value);
    // Limpa o operador selecionado se o usuário alterar a busca
    if (selectedOperator) {
      setSelectedOperator(null);
    }
  };

  useEffect(() => {
    if (operatorQuery.trim() && !selectedOperator) {
      const timer = setTimeout(() => {
        searchOperators(operatorQuery).then(results => {
          setOperators(results);
          setIsDropdownOpen(results.length > 0);
        });
      }, 300); // Debounce para evitar muitas requisições
      return () => clearTimeout(timer);
    } else {
      setOperators([]);
      setIsDropdownOpen(false);
    }
  }, [operatorQuery, selectedOperator]);

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
    setOperatorQuery(`${operator.code} - ${operator.name}`);
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOperator) {
      alert('Por favor, selecione um operador válido');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await onConfirm({
        startTime: formData.get('startTime') as string,
        endTime: formData.get('endTime') as string,
        measurement: formData.get('measurement') as string,
        operatorName: `${selectedOperator.code} - ${selectedOperator.name}`,
        notes: formData.get('notes') as string,
      });
      
      // Limpa os campos após envio
      setOperatorQuery('');
      setSelectedOperator(null);
      onClose();
    } catch (error) {
      // O erro já é tratado no App.tsx, mas podemos adicionar um feedback aqui se necessário
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              padding: '24px',
              width: '90%',
              maxWidth: '400px',
              position: 'relative'
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Assinar Operação</h2>
            <p style={{ color: '#666', marginBottom: '16px' }}>Modal de teste - isOpen: {String(isOpen)}</p>
            <p style={{ color: '#666', marginBottom: '16px' }}>Modal funcionando!</p>
            <p style={{ color: 'green', marginBottom: '16px', fontWeight: 'bold' }}>✅ MODAL VISÍVEL!</p>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Campo de busca de operador */}
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Operador
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={operatorQuery}
                    onChange={handleOperatorInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                    placeholder="Digite código ou nome"
                    autoComplete="off"
                  />
                </div>
                
                {/* Dropdown de resultados */}
                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    zIndex: 10,
                    marginTop: '4px',
                    width: '100%',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    maxHeight: '240px',
                    overflow: 'auto'
                  }}>
                    {operators.map((operator) => (
                      <div
                        key={operator._id}
                        style={{
                          padding: '8px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f3f4f6'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        onClick={() => handleOperatorSelect(operator)}
                      >
                        <div style={{ fontWeight: '500' }}>{operator.code} - {operator.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{operator.role}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                    Horário Início
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                    Horário Término
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Medição (mm)
                </label>
                <input
                  type="text"
                  name="measurement"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px'
                  }}
                  placeholder="Ex: 12.45"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Observações
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                  placeholder="Observações adicionais (opcional)"
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedOperator || isSubmitting}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: selectedOperator && !isSubmitting ? '#04514B' : '#9ca3af',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: selectedOperator && !isSubmitting ? 'pointer' : 'not-allowed'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedOperator && !isSubmitting) {
                      e.currentTarget.style.backgroundColor = '#033b36';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedOperator && !isSubmitting) {
                      e.currentTarget.style.backgroundColor = '#04514B';
                    }
                  }}
                >
                  {isSubmitting ? 'A guardar...' : 'Confirmar'}
                </button>
              </div>
            </form>

            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#9ca3af'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#6b7280'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Debug info sempre visível */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 10000
      }}>
        Modal Debug: isOpen = {String(isOpen)}
      </div>
    </>
  );
}

