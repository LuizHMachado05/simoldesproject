// @ts-ignore
import { connectToDatabase, closeConnection } from '../config/mongodb';

async function setupDatabase() {
  try {
    console.log("Iniciando configuração do banco de dados...");
    const db = await connectToDatabase();
    
    // Lista de collections para criar
    const collections = ['operators', 'machines', 'programs', 'logs'];
    
    // Obter lista de collections existentes
    const existingCollections = await db.listCollections().toArray();
    const existingCollectionNames = existingCollections.map((col: any) => col.name);
    
    // Criar collections que não existem
    for (const collection of collections) {
      if (!existingCollectionNames.includes(collection)) {
        console.log(`Criando collection: ${collection}`);
        await db.createCollection(collection);
      } else {
        console.log(`Collection já existe: ${collection}`);
      }
    }
    
    // Adicionar dados iniciais (opcional)
    const operatorsCount = await db.collection('operators').countDocuments();
    if (operatorsCount === 0) {
      console.log("Adicionando operadores iniciais...");
      await db.collection('operators').insertMany([
        {
          "matricula": "123456",
          "nome": "Luiz Henrique",
          "cargo": "Operador CNC",
          "turno": "Manhã"
        },
        {
          "matricula": "234567",
          "nome": "Maria Silva",
          "cargo": "Operadora CNC",
          "turno": "Tarde"
        }
      ]);
    }
    
    const machinesCount = await db.collection('machines').countDocuments();
    if (machinesCount === 0) {
      console.log("Adicionando máquinas iniciais...");
      await db.collection('machines').insertMany([
        {
          "codigo_maquina": "F1400",
          "nome_maquina": "Fresadora CNC 1400",
          "senha": "",
          "status": "ativo"
        },
        {
          "codigo_maquina": "T2500",
          "nome_maquina": "Torno CNC 2500",
          "senha": "654321",
          "status": "ativo"
        }
      ]);
    }
    
    console.log("Configuração do banco de dados concluída com sucesso!");
    await closeConnection();
  } catch (error) {
    console.error("Erro ao configurar banco de dados:", error);
  }
}

// Executar a função
setupDatabase();
