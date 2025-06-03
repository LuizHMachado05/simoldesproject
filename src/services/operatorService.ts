import operatorsData from '../data/operators.json';

export interface Operator {
  matricula: string;
  nome: string;
  cargo: string;
  turno: string;
}

export function getOperators(): Operator[] {
  return operatorsData;
}

export function searchOperators(query: string): Operator[] {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  
  return operatorsData.filter(
    (operator) => 
      operator.matricula.includes(lowerQuery) || 
      operator.nome.toLowerCase().includes(lowerQuery)
  );
}