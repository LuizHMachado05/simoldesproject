import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

// Dados iniciais
const initialData = {
  operators: [
    {
      name: "João Silva",
      code: "JS001",
      role: "operator",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      name: "Maria Santos",
      code: "MS002",
      role: "operator",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      name: "Pedro Oliveira",
      code: "PO003",
      role: "operator",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  machines: [
    {
      machineId: "F1400",
      name: "Fresadora 1400",
      password: "f1400pass",
      status: "active",
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      machineId: "T2500",
      name: "Torno 2500",
      password: "t2500pass",
      status: "active",
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  projects: [
    {
      projectId: "1668_18",
      name: "MOLDE CARCAÇA FRONTAL",
      machine: "F1400",
      programPath: "U:/F1400/1668_18",
      material: "1730",
      date: new Date().toISOString(),
      programmer: "diego.verciano",
      blockCenter: "X0,0 Y0,0",
      reference: "EM Z: 20,0",
      observations: "PRENDER SOBRE CALÇOS DE 10mm",
      imageUrl: "/programCapa.png",
      status: "in_progress",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  operations: [
    {
      projectId: "1668_18",
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  operationLogs: [
    {
      type: "complete",
      value: "54.99",
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ],
  moldPrograms: [
    {
      id: "1665_15",
      name: "MOLDE LATERAL DIREITO",
      machine: "F1400",
      programPath: "U:/F1400/1665_15",
      material: "1730",
      date: "05/02/2024",
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
    for (const [collection, data] of Object.entries(initialData)) {
      if (data.length > 0) {
        await db.collection(collection).insertMany(data);
        console.log(`✅ ${data.length} documentos inseridos em ${collection}`);
      }
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