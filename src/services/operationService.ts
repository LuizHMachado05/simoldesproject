const API_BASE_URL = 'http://localhost:3001/api';

export interface SignOperationData {
  projectId: string;
  operationId: number;
  operatorName: string;
  startTime: string;
  endTime: string;
  measurement: string;
  notes?: string;
}

export const signOperation = async (data: SignOperationData): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/operations/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erro ao assinar operação:', error);
    throw error;
  }
}; 