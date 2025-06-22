import { MongoClient, ObjectId } from 'mongodb';

const uri = "mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes";
const client = new MongoClient(uri);

const historicPrograms = [
  {
    projectId: '1665_15',
    name: 'MOLDE LATERAL DIREITO',
    machine: 'F1400',
    programPath: 'U:/F1400/1665_15',
    material: '1730',
    date: new Date('2024-02-05'),
    programmer: 'diego.verciano',
    blockCenter: 'X0,0 Y0,0',
    reference: 'EM Z: 15,0',
    observations: 'VERIFICAR ALINHAMENTO INICIAL',
    imageUrl: '/programCapa.png',
    status: 'completed',
    completedDate: new Date('2024-02-05 10:45:00'),
    createdAt: new Date(),
    updatedAt: new Date(),
    operations: [
      {
        sequence: '04',
        type: 'Furação',
        function: 'Pré-furo',
        centerPoint: '42',
        toolRef: 'BK_DRILL_D38_SSD_701800022',
        ic: '235',
        alt: '260',
        time: {
          machine: '09:15:00',
          total: '09:45:30'
        },
        details: {
          depth: '85mm',
          speed: '2800 RPM',
          feed: '0.12mm/rev',
          coolant: 'Externa 45 bar'
        },
        quality: {
          tolerance: '±0.02mm',
          surfaceFinish: 'Ra 0.8',
          requirements: ['Verificar circularidade']
        },
        imageUrl: '/operation.png',
        completed: true,
        signedBy: 'carlos.silva',
        timestamp: new Date('2024-02-05 09:45:30'),
        timeRecord: {
          start: new Date('2024-02-05 09:15:00'),
          end: new Date('2024-02-05 09:45:30')
        },
        measurementValue: '37.98'
      },
      {
        sequence: '05',
        type: 'Fresamento',
        function: 'Acabamento lateral',
        centerPoint: '38',
        toolRef: 'BK_FINISH_D32_SSD_701800045',
        ic: '190',
        alt: '215',
        time: {
          machine: '10:00:00',
          total: '10:45:00'
        },
        details: {
          depth: '55mm',
          speed: '3500 RPM',
          feed: '0.08mm/rev',
          coolant: 'Externa 50 bar'
        },
        quality: {
          tolerance: '±0.01mm',
          surfaceFinish: 'Ra 0.4',
          requirements: ['Medir planicidade', 'Verificar acabamento']
        },
        imageUrl: '/operation.png',
        completed: true,
        signedBy: 'carlos.silva',
        timestamp: new Date('2024-02-05 10:45:00'),
        timeRecord: {
          start: new Date('2024-02-05 10:00:00'),
          end: new Date('2024-02-05 10:45:00')
        },
        measurementValue: '54.99'
      }
    ]
  },
  {
    projectId: '1666_16',
    name: 'MOLDE BASE SUPERIOR',
    machine: 'F1600',
    programPath: 'U:/F1600/1666_16',
    material: '1740',
    date: new Date('2024-02-06'),
    programmer: 'ana.santos',
    blockCenter: 'X0,0 Y0,0',
    reference: 'EM Z: 25,0',
    observations: 'USAR SUPORTE ESPECIAL',
    imageUrl: '/programCapa.png',
    status: 'completed',
    completedDate: new Date('2024-02-06 15:30:00'),
    createdAt: new Date(),
    updatedAt: new Date(),
    operations: [
      {
        sequence: '06',
        type: 'Fresamento',
        function: 'Desbaste',
        centerPoint: '52',
        toolRef: 'BK_ROUGH_D63_SSD_701800078',
        ic: '280',
        alt: '305',
        time: {
          machine: '13:30:00',
          total: '14:15:00'
        },
        details: {
          depth: '95mm',
          speed: '2200 RPM',
          feed: '0.18mm/rev',
          coolant: 'Externa 55 bar'
        },
        quality: {
          tolerance: '±0.05mm',
          surfaceFinish: 'Ra 1.6',
          requirements: ['Verificar profundidade']
        },
        imageUrl: '/operation.png',
        completed: true,
        signedBy: 'roberto.oliveira',
        timestamp: new Date('2024-02-06 14:15:00'),
        timeRecord: {
          start: new Date('2024-02-06 13:30:00'),
          end: new Date('2024-02-06 14:15:00')
        },
        measurementValue: '94.97'
      },
      {
        sequence: '07',
        type: 'Fresamento',
        function: 'Acabamento',
        centerPoint: '45',
        toolRef: 'BK_FINISH_D40_SSD_701800089',
        ic: '225',
        alt: '250',
        time: {
          machine: '14:30:00',
          total: '15:30:00'
        },
        details: {
          depth: '95mm',
          speed: '3000 RPM',
          feed: '0.1mm/rev',
          coolant: 'Externa 60 bar'
        },
        quality: {
          tolerance: '±0.01mm',
          surfaceFinish: 'Ra 0.4',
          requirements: ['Medir rugosidade', 'Verificar dimensional']
        },
        imageUrl: '/operation.png',
        completed: true,
        signedBy: 'roberto.oliveira',
        timestamp: new Date('2024-02-06 15:30:00'),
        timeRecord: {
          start: new Date('2024-02-06 14:30:00'),
          end: new Date('2024-02-06 15:30:00')
        },
        measurementValue: '95.00'
      }
    ]
  }
];

const moldPrograms = [
  {
    projectId: '1668_18',
    name: 'MOLDE CARCAÇA FRONTAL',
    machine: 'F1400',
    programPath: 'U:/F1400/1668_18',
    material: '1730',
    date: new Date('2024-02-10'),
    programmer: 'diego.verciano',
    blockCenter: 'X0,0 Y0,0',
    reference: 'EM Z: 20,0',
    observations: 'PRENDER SOBRE CALÇOS DE 10mm',
    imageUrl: '/programCapa.png',
    status: 'in_progress',
    createdAt: new Date(),
    updatedAt: new Date(),
    operations: [
      {
        sequence: '07',
        type: 'Furação',
        function: 'Centro',
        centerPoint: '48',
        toolRef: 'BK_TOPDRIL_D44_SSD_701800011',
        ic: '247',
        alt: '273',
        time: {
          machine: '10:30:12',
          total: '10:38:15'
        },
        details: {
          depth: '120mm',
          speed: '2400 RPM',
          feed: '0.15mm/rev',
          coolant: 'Externa 40 bar',
          notes: 'Verificar alinhamento antes de iniciar'
        },
        quality: {
          tolerance: '±0.008mm',
          surfaceFinish: 'Ra 0.2',
          requirements: [
            'Verificar concentricidade',
            'Medir circularidade',
            'Controle 100% dimensional'
          ]
        },
        imageUrl: '/operation.png',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    projectId: '1669_22',
    name: 'MOLDE TAMPA SUPERIOR',
    machine: 'F1600',
    programPath: 'U:/F1600/1669_22',
    material: '1740',
    date: new Date('2024-02-12'),
    programmer: 'ana.santos',
    blockCenter: 'X0,0 Y0,0',
    reference: 'EM Z: 30,0',
    observations: 'UTILIZAR SUPORTE ESPECIAL',
    imageUrl: '/programCapa.png',
    status: 'in_progress',
    createdAt: new Date(),
    updatedAt: new Date(),
    operations: [
      {
        sequence: '05',
        type: 'Furação',
        function: 'Pré-furo',
        centerPoint: '40',
        toolRef: 'BK_DRILL_D32_SSD_701800044',
        ic: '220',
        alt: '245',
        time: {
          machine: '11:00:00',
          total: '11:45:20'
        },
        details: {
          depth: '75mm',
          speed: '2900 RPM',
          feed: '0.10mm/rev',
          coolant: 'Interna 60 bar',
          notes: 'Controle dimensional crítico'
        },
        quality: {
          tolerance: '±0.008mm',
          surfaceFinish: 'Ra 0.2',
          requirements: [
            'Verificar concentricidade',
            'Medir circularidade',
            'Controle 100% dimensional'
          ]
        },
        imageUrl: '/operation.png',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }
];

async function seedAllProjectData() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('simoldes');

    // Inserir projetos históricos
    for (const project of historicPrograms) {
      const { operations, ...projectData } = project;
      
      // Inserir o projeto
      const projectResult = await db.collection('projects').insertOne(projectData);
      console.log(`Inserted project: ${project.name}`);

      // Inserir as operações do projeto
      const operationsWithProjectId = operations.map(operation => ({
        ...operation,
        projectId: projectResult.insertedId
      }));

      await db.collection('operations').insertMany(operationsWithProjectId);
      console.log(`Inserted ${operations.length} operations for project: ${project.name}`);

      // Criar logs para cada operação
      const operationLogs = operations.map(operation => ({
        operationId: new ObjectId(),
        projectId: projectResult.insertedId,
        machineId: project.machine,
        type: 'complete',
        value: operation.measurementValue,
        timestamp: operation.timestamp || new Date(),
        createdAt: new Date()
      }));

      await db.collection('operationLogs').insertMany(operationLogs);
      console.log(`Inserted operation logs for project: ${project.name}`);
    }

    // Inserir projetos ativos
    for (const project of moldPrograms) {
      const { operations, ...projectData } = project;
      
      // Inserir o projeto
      const projectResult = await db.collection('projects').insertOne(projectData);
      console.log(`Inserted project: ${project.name}`);

      // Inserir as operações do projeto
      const operationsWithProjectId = operations.map(operation => ({
        ...operation,
        projectId: projectResult.insertedId
      }));

      await db.collection('operations').insertMany(operationsWithProjectId);
      console.log(`Inserted ${operations.length} operations for project: ${project.name}`);
    }

    console.log('All project data seeded successfully');
  } catch (error) {
    console.error('Error seeding project data:', error);
  } finally {
    await client.close();
  }
}

// Executar o script
seedAllProjectData().catch(console.error); 