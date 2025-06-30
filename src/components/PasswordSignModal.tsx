import React, { useState } from 'react';
import { Lock, User, AlertCircle } from 'lucide-react';
import { authenticateOperator, Operator } from '../services/operatorService';

interface PasswordSignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (operator: Operator, data: {
    startTime: string;
    endTime: string;
    measurement: string;
    notes?: string;
  }) => void;
  operationData: {
    operatorName: string;
    startTime: string;
    endTime: string;
    measurement: string;
    notes?: string;
  };
}

export function PasswordSignModal({ isOpen, onClose, onConfirm, operationData }: PasswordSignModalProps) {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Extrair o código do operador do nome (formato: "CODIGO - NOME")
  const extractOperatorCode = (operatorName: string) => {
    const match = operatorName.match(/^([A-Z0-9]+)\s*-\s*(.+)$/);
    return match ? match[1] : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Por favor, digite sua senha');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Extrair código do operador do nome
      const code = extractOperatorCode(operationData.operatorName);
      if (!code) {
        setError('Formato de operador inválido');
        return;
      }

      // Autenticar operador
      const operator = await authenticateOperator(code, password);
      
      if (!operator) {
        setError('Código de operador ou senha incorretos');
        return;
      }

      // Verificar se o operador autenticado corresponde ao nome informado
      const expectedMatricula = extractOperatorCode(operationData.operatorName);
      if (operator.matricula !== expectedMatricula) {
        setError('Operador autenticado não corresponde ao operador informado');
        return;
      }

      // Confirmar assinatura
      await onConfirm(operator, {
        startTime: operationData.startTime,
        endTime: operationData.endTime,
        measurement: operationData.measurement,
        notes: operationData.notes
      });

      // Limpar formulário
      setPassword('');
      setError('');
      onClose();
      
    } catch (error) {
      console.error('Erro na autenticação:', error);
      setError('Erro ao autenticar operador. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
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
          maxWidth: '450px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#04514B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock style={{ color: 'white', width: '20px', height: '20px' }} />
            </div>
            <div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                color: '#111827',
                margin: 0
              }}>
                Autenticação de Operador
              </h2>
              <p style={{ 
                fontSize: '14px', 
                color: '#6b7280', 
                margin: '4px 0 0 0'
              }}>
                Digite sua senha para confirmar a assinatura
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
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
          {/* Informações do operador */}
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <User style={{ color: '#04514B', width: '16px', height: '16px' }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Operador
              </span>
            </div>
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
              {operationData.operatorName}
            </span>
          </div>

          {/* Campo de senha */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#374151'
            }}>
              Senha *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
                fontSize: '14px',
                transition: 'all 0.2s',
                backgroundColor: '#f9fafb'
              }}
              placeholder="Digite sua senha"
              onFocus={(e) => {
                e.target.style.borderColor = '#04514B';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(4, 81, 75, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = error ? '#ef4444' : '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626'
            }}>
              <AlertCircle style={{ width: '16px', height: '16px' }} />
              <span style={{ fontSize: '14px' }}>{error}</span>
            </div>
          )}

          {/* Botões */}
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
              onClick={handleClose}
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
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!password.trim() || isSubmitting}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '12px',
                backgroundColor: password.trim() && !isSubmitting ? '#04514B' : '#9ca3af',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: password.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: password.trim() && !isSubmitting ? '0 4px 6px -1px rgba(4, 81, 75, 0.2)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (password.trim() && !isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#033b36';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(4, 81, 75, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (password.trim() && !isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#04514B';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(4, 81, 75, 0.2)';
                }
              }}
            >
              {isSubmitting ? 'Autenticando...' : 'Confirmar Assinatura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 