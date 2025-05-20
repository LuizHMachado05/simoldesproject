import machinesData from '../data/machines.json';

export interface Machine {
  codigo_maquina: string;
  nome_maquina: string;
  senha: string;
  status: string;
}

export async function authenticateMachine(codigo_maquina: string, senha: string): Promise<Machine | null> {
  // Simula uma chamada assíncrona
  return new Promise((resolve) => {
    setTimeout(() => {
      // Busca a máquina pelo código e senha
      const machine = machinesData.find(
        (m) => m.codigo_maquina === codigo_maquina && m.senha === senha
      );
      
      resolve(machine || null);
    }, 500); // Simula um pequeno delay de rede
  });
}


