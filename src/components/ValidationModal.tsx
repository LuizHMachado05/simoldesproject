import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import * as Checkbox from '@radix-ui/react-checkbox';
import { format } from 'date-fns';
import { CheckIcon } from 'lucide-react';
import { operationValidationSchema, type OperationValidationData } from '../schemas/validation';
import { type Operation } from '../types';

interface ValidationModalProps {
  operation: Operation;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OperationValidationData) => void;
  mode: 'start' | 'pause' | 'resume' | 'complete';
}

export function ValidationModal({ operation, isOpen, onClose, onSubmit, mode }: ValidationModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<OperationValidationData>({
    resolver: zodResolver(operationValidationSchema),
    defaultValues: {
      notes: '',
      measurements: operation.measurements?.required.map(m => ({
        id: m.id,
        value: '',
        description: m.description
      })) || []
    }
  });

  const getModalTitle = () => {
    switch (mode) {
      case 'start': return 'Iniciar Operação';
      case 'pause': return 'Pausar Operação';
      case 'resume': return 'Retomar Operação';
      case 'complete': return 'Finalizar Operação';
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl">
          <Dialog.Title className="text-xl font-bold mb-4">
            {getModalTitle()}
          </Dialog.Title>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Campo de notas sempre visível */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Observações
                </label>
                <textarea
                  {...register('notes')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Adicione observações relevantes..."
                />
              </div>

              {/* Campos de medição apenas na conclusão */}
              {mode === 'complete' && (
                <>
                  {operation.measurements?.required.map((measurement, index) => (
                    <div key={measurement.id}>
                      <label className="text-sm font-medium text-gray-700">
                        {measurement.description}
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        {...register(`measurements.${index}.value`)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {mode === 'start' && 'Iniciar'}
                {mode === 'pause' && 'Pausar'}
                {mode === 'resume' && 'Retomar'}
                {mode === 'complete' && 'Concluir'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
