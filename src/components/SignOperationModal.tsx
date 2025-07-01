import { X, Search, User, RefreshCw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getOperators, Operator } from '../services/operatorService';

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
  const [allOperators, setAllOperators] = useState<Operator[]>([]);
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOperators, setIsLoadingOperators] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carregar todos os operadores quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadAllOperators();
    }
  }, [isOpen]);

  const loadAllOperators = async () => {
    setIsLoadingOperators(true);
    try {
      const operators = await getOperators();
      setAllOperators(operators);
      setFilteredOperators(operators);
    } catch (error) {
      console.error('Erro ao carregar operadores:', error);
    } finally {
      setIsLoadingOperators(false);
    }
  };

  const handleOperatorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setOperatorQuery(query);
    
    // Limpa o operador selecionado se o usuário alterar a busca
    if (selectedOperator) {
      setSelectedOperator(null);
    }

    // Filtrar operadores em tempo real
    if (query.trim()) {
      const filtered = allOperators.filter(operator =>
        operator.name.toLowerCase().includes(query.toLowerCase()) ||
        operator.code.toLowerCase().includes(query.toLowerCase()) ||
        operator.matricula?.toLowerCase().includes(query.toLowerCase()) ||
        operator.cargo?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredOperators(filtered);
    } else {
      setFilteredOperators(allOperators);
    }
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
    setFilteredOperators(allOperators);
  };

  const handleInputClick = () => {
    setIsDropdownOpen(true);
    setFilteredOperators(allOperators);
  };

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
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '32px',
              width: '90%',
              maxWidth: '500px',
              position: 'relative',
              border: '1px solid #e5e7eb'
            }}
          >
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #f3f4f6'
            }}>
              <div>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#111827',
                  margin: 0
                }}>
                  Assinar Operação
                </h2>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  margin: '4px 0 0 0'
                }}>
                  Preencha os dados para finalizar a operação
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Campo de busca de operador */}
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#374151'
                }}>
                  Operador *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={operatorQuery}
                    onChange={handleOperatorInputChange}
                    onFocus={(e) => {
                      handleInputFocus();
                      e.target.style.borderColor = '#04514B';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(4, 81, 75, 0.1)';
                    }}
                    onMouseDown={handleInputClick}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                      backgroundColor: '#f9fafb'
                    }}
                    placeholder="Clique para ver todos os operadores ou digite para filtrar"
                    autoComplete="off"
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {isLoadingOperators && (
                    <div style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}>
                      <RefreshCw size={18} className="animate-spin" style={{ color: '#04514B' }} />
                    </div>
                  )}
                </div>
                
                {/* Dropdown de resultados */}
                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    zIndex: 10,
                    marginTop: '8px',
                    width: '100%',
                    backgroundColor: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    maxHeight: '280px',
                    overflow: 'auto'
                  }}>
                    {filteredOperators.length === 0 ? (
                      <div style={{
                        padding: '20px 16px',
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: '14px'
                      }}>
                        {operatorQuery.trim() ? 'Nenhum operador encontrado' : 'Carregando operadores...'}
                      </div>
                    ) : (
                      filteredOperators.map((operator) => (
                      <div
                        key={operator._id}
                        style={{
                            padding: '16px',
                          cursor: 'pointer',
                            borderBottom: '1px solid #f3f4f6',
                            transition: 'all 0.2s'
                        }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                            e.currentTarget.style.borderLeft = '4px solid #04514B';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.borderLeft = '4px solid transparent';
                          }}
                        onClick={() => handleOperatorSelect(operator)}
                      >
                          <div style={{ 
                            fontWeight: '600', 
                            fontSize: '15px',
                            color: '#111827',
                            marginBottom: '4px'
                          }}>
                            {operator.code} - {operator.name}
                          </div>
                          <div style={{ 
                            fontSize: '13px', 
                            color: '#6b7280',
                            marginBottom: '2px'
                          }}>
                            {operator.matricula && `Matrícula: ${operator.matricula}`}
                            {operator.cargo && ` • ${operator.cargo}`}
                            {operator.turno && ` • ${operator.turno}`}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#9ca3af',
                            textTransform: 'capitalize',
                            fontWeight: '500'
                          }}>
                            {operator.role}
                          </div>
                      </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    marginBottom: '8px',
                    color: '#374151'
                  }}>
                    Horário Início *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '14px',
                      backgroundColor: '#f9fafb',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#04514B';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(4, 81, 75, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    marginBottom: '8px',
                    color: '#374151'
                  }}>
                    Horário Término *
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '14px',
                      backgroundColor: '#f9fafb',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#04514B';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(4, 81, 75, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#374151'
                }}>
                  Medição (mm) *
                </label>
                <input
                  type="text"
                  name="measurement"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '14px',
                    backgroundColor: '#f9fafb',
                    transition: 'all 0.2s'
                  }}
                  placeholder="Ex: 12.45"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#04514B';
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(4, 81, 75, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#374151'
                }}>
                  Observações
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '14px',
                    backgroundColor: '#f9fafb',
                    resize: 'vertical',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Observações adicionais (opcional)"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#04514B';
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(4, 81, 75, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                ></textarea>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '12px', 
                paddingTop: '8px',
                marginTop: '8px',
                borderTop: '2px solid #f3f4f6'
              }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '12px 24px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedOperator || isSubmitting}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '12px',
                    backgroundColor: selectedOperator && !isSubmitting ? '#04514B' : '#9ca3af',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: selectedOperator && !isSubmitting ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    boxShadow: selectedOperator && !isSubmitting ? '0 4px 6px -1px rgba(4, 81, 75, 0.2)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedOperator && !isSubmitting) {
                      e.currentTarget.style.backgroundColor = '#033b36';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(4, 81, 75, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedOperator && !isSubmitting) {
                      e.currentTarget.style.backgroundColor = '#04514B';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(4, 81, 75, 0.2)';
                    }
                  }}
                >
                  {isSubmitting ? 'A guardar...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

