import React from 'react';
import { Eye, CheckCircle2, RefreshCw } from 'lucide-react';

interface OperationActionsProps {
  completed: boolean;
  onView: (e: React.MouseEvent) => void;
  onSign: (e: React.MouseEvent) => void;
  onEdit?: (e: React.MouseEvent) => void;
  isHistory?: boolean;
}

export function OperationActions({ 
  completed, 
  onView, 
  onSign,
  onEdit,
  isHistory = false 
}: OperationActionsProps) {
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onView(e);
        }}
        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Eye className="h-4 w-4 mr-1" />
        Visualizar
      </button>
      
      {!completed && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSign(e);
          }}
          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Assinar
        </button>
      )}

      {completed && (
        <div className="inline-flex items-center px-2.5 py-1.5 border border-green-300 text-xs font-medium rounded text-green-800 bg-green-100">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Assinado
        </div>
      )}
      
      {completed && !isHistory && onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(e);
          }}
          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Editar
        </button>
      )}
    </div>
  );
}



