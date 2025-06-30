import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes";

// Dados iniciais
const initialData = {
  operators: [
    {
      name: "João Silva",
      code: "JS001",
      role: "operator",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Maria Santos",
      code: "MS002",
      role: "operator",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Pedro Oliveira",
      code: "PO003",
      role: "operator",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  machines: [
    {
      machineId: "F1400",
      name: "Fresadora 1400",
      password: "f1400pass",
      status: "active",
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      machineId: "T2500",
      name: "Torno 2500",
      password: "t2500pass",
      status: "active",
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  projects: [
    {
      projectId: "1668_18",
      name: "MOLDE CARCAÇA FRONTAL",
      machine: "F1400",
      programPath: "U:/F1400/1668_18",
      material: "1730",
      date: new Date(),
      programmer: "diego.verciano",
      blockCenter: "X0,0 Y0,0",
      reference: "EM Z: 20,0",
      observations: "PRENDER SOBRE CALÇOS DE 10mm",
      imageUrl: "/programCapa.png",
      status: "in_progress",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  operations: [
    {
      sequence: "07",
      type: "Furação",
      function: "Centro",
      centerPoint: "48",
      toolRef: "BK_TOPDRIL_D44_SSD_701800011",
      ic: "247",
      alt: "273",
      time: {
        machine: "10:30:12",
        total: "10:38:15"
      },
      details: {
        depth: "120mm",
        speed: "2400 RPM",
        feed: "0.15mm/rev",
        coolant: "Externa 40 bar",
        notes: "Verificar alinhamento antes de iniciar"
      },
      quality: {
        tolerance: "±0.008mm",
        surfaceFinish: "Ra 0.2",
        requirements: [
          "Verificar concentricidade",
          "Medir circularidade",
          "Controle 100% dimensional"
        ]
      },
      imageUrl: "/operation.png",
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  operationLogs: [
    {
      operationId: null,
      projectId: null,
      machineId: "F1400",
      operatorId: null,
      type: "complete",
      value: "54.99",
      timestamp: new Date(),
      createdAt: new Date()
    }
  ],
  moldPrograms: [
    {
      id: "1665_15",
      name: "MOLDE LATERAL DIREITO",
      machine: "F1400",
      programPath: "U:/F1400/1665_15",
      material: "1730",
      date: new Date("2024-02-05"),
      programmer: "diego.verciano",
      blockCenter: "X0,0 Y0,0",
      reference: "EM Z: 15,0",
      observations: "VERIFICAR ALINHAMENTO INICIAL",
      imageUrl: "/simoldeslogo.png",
      status: "in_progress",
      operations: [
        {
          id: 1,
          sequence: "04",
          type: "Furação",
          function: "Pré-furo",
          centerPoint: "42",
          toolRef: "BK_DRILL_D38_SSD_701800022",
          ic: "235",
          alt: "260",
          time: {
            machine: "09:15:00",
            total: "09:45:30"
          },
          details: {
            depth: "85mm",
            speed: "2800 RPM",
            feed: "0.12mm/rev",
            coolant: "Externa 45 bar"
          },
          quality: {
            tolerance: "±0.02mm",
            surfaceFinish: "Ra 0.8",
            requirements: [
              "Verificar circularidade"
            ]
          },
          imageUrl: "/operation.png",
          completed: false
        }
      ]
    }
  ]
};

async function seedDatabase() {
  const client = new MongoClient(uri);
  
  try {
    console.log('Conectando ao MongoDB...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    const db = client.db('simoldes');
    
    // Limpar collections existentes
    console.log('\nLimpando collections existentes...');
    for (const collection of Object.keys(initialData)) {
      await db.collection(collection).deleteMany({});
      console.log(`Collection ${collection} limpa`);
    }

    // Inserir dados iniciais
    console.log('\nInserindo dados iniciais...');
    
    // Inserir operators
    if (initialData.operators.length > 0) {
      await db.collection('operators').insertMany(initialData.operators);
      console.log(`✅ ${initialData.operators.length} documentos inseridos em operators`);
    }

    // Inserir machines
    if (initialData.machines.length > 0) {
      await db.collection('machines').insertMany(initialData.machines);
      console.log(`✅ ${initialData.machines.length} documentos inseridos em machines`);
    }

    // Inserir projects primeiro
    if (initialData.projects.length > 0) {
      const projectResult = await db.collection('projects').insertMany(initialData.projects);
      console.log(`✅ ${initialData.projects.length} documentos inseridos em projects`);
      
      // Pegar o _id do projeto inserido para usar nas operations
      const projectId = projectResult.insertedIds[0];
      
      // Inserir operations com o projectId correto
      if (initialData.operations.length > 0) {
        const operationsWithProjectId = initialData.operations.map(op => ({
          ...op,
          projectId: projectId
        }));
        
        const operationResult = await db.collection('operations').insertMany(operationsWithProjectId);
        console.log(`✅ ${initialData.operations.length} documentos inseridos em operations`);
        
        // Pegar o _id da operation inserida para usar nos logs
        const operationId = operationResult.insertedIds[0];
        
        // Pegar o _id do primeiro operator para usar nos logs
        const operator = await db.collection('operators').findOne({});
        const operatorId = operator ? operator._id : null;
        
        // Inserir operationLogs com os IDs corretos
        if (initialData.operationLogs.length > 0) {
          const logsWithIds = initialData.operationLogs.map(log => ({
            ...log,
            operationId: operationId,
            projectId: projectId,
            operatorId: operatorId
          }));
          
          await db.collection('operationLogs').insertMany(logsWithIds);
          console.log(`✅ ${initialData.operationLogs.length} documentos inseridos em operationLogs`);
        }
      }
    }

    // Inserir moldPrograms
    if (initialData.moldPrograms.length > 0) {
      await db.collection('moldPrograms').insertMany(initialData.moldPrograms);
      console.log(`✅ ${initialData.moldPrograms.length} documentos inseridos em moldPrograms`);
    }

    // Verificar dados inseridos
    console.log('\nVerificando dados inseridos...');
    for (const collection of Object.keys(initialData)) {
      const count = await db.collection(collection).countDocuments();
      console.log(`Collection ${collection}: ${count} documentos`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
    console.log('\nConexão fechada.');
  }
}

// Executar o seed
seedDatabase().catch(console.error); 