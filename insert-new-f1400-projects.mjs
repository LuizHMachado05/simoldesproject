import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes";
const client = new MongoClient(uri);

const newProjects = [
  {
    projectId: '1670_30',
    name: 'MOLDE SUPORTE MOTOR',
    machine: 'F1400',
    programPath: 'U:/F1400/1670_30',
    material: '1750',
    date: new Date('2024-03-01'),
    programmer: 'mario.souza',
    blockCenter: 'X0,0 Y0,0',
    reference: 'EM Z: 10,0',
    observations: 'FIXAR COM GRAMPOS LATERAIS',
    imageUrl: '/programCapa.png',
    status: 'in_progress',
    createdAt: new Date(),
    updatedAt: new Date(),
    operations: [
      {
        sequence: '01',
        type: 'Furação',
        function: 'Furo guia',
        centerPoint: '50',
        toolRef: 'BK_GUIDE_D20_SSD_701800099',
        ic: '200',
        alt: '220',
        time: {
          machine: '08:00:00',
          total: '08:30:00'
        },
        details: {
          depth: '60mm',
          speed: '2500 RPM',
          feed: '0.10mm/rev',
          coolant: 'Externa 30 bar',
          notes: 'Furo inicial para guia do suporte'
        },
        quality: {
          tolerance: '±0.02mm',
          surfaceFinish: 'Ra 0.8',
          requirements: ['Verificar alinhamento']
        },
        imageUrl: '/operation.png',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sequence: '02',
        type: 'Fresamento',
        function: 'Desbaste suporte',
        centerPoint: '55',
        toolRef: 'BK_MILL_D40_SSD_701800120',
        ic: '210',
        alt: '230',
        time: {
          machine: '09:00:00',
          total: '09:45:00'
        },
        details: {
          depth: '70mm',
          speed: '2600 RPM',
          feed: '0.12mm/rev',
          coolant: 'Externa 35 bar',
          notes: 'Desbaste geral do suporte'
        },
        quality: {
          tolerance: '±0.05mm',
          surfaceFinish: 'Ra 1.2',
          requirements: ['Verificar profundidade']
        },
        imageUrl: '/operation.png',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    projectId: '1671_31',
    name: 'MOLDE TAMPA LATERAL',
    machine: 'F1400',
    programPath: 'U:/F1400/1671_31',
    material: '1760',
    date: new Date('2024-03-05'),
    programmer: 'lucas.pereira',
    blockCenter: 'X0,0 Y0,0',
    reference: 'EM Z: 12,0',
    observations: 'USAR BASE NIVELADA',
    imageUrl: '/programCapa.png',
    status: 'in_progress',
    createdAt: new Date(),
    updatedAt: new Date(),
    operations: [
      {
        sequence: '01',
        type: 'Furação',
        function: 'Furo central',
        centerPoint: '60',
        toolRef: 'BK_DRILL_D25_SSD_701800150',
        ic: '215',
        alt: '240',
        time: {
          machine: '10:00:00',
          total: '10:30:00'
        },
        details: {
          depth: '80mm',
          speed: '2700 RPM',
          feed: '0.11mm/rev',
          coolant: 'Externa 40 bar',
          notes: 'Furo para fixação da tampa'
        },
        quality: {
          tolerance: '±0.015mm',
          surfaceFinish: 'Ra 0.6',
          requirements: ['Verificar diâmetro']
        },
        imageUrl: '/operation.png',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sequence: '02',
        type: 'Fresamento',
        function: 'Acabamento tampa',
        centerPoint: '65',
        toolRef: 'BK_FINISH_D30_SSD_701800160',
        ic: '225',
        alt: '250',
        time: {
          machine: '11:00:00',
          total: '11:40:00'
        },
        details: {
          depth: '75mm',
          speed: '2800 RPM',
          feed: '0.09mm/rev',
          coolant: 'Externa 45 bar',
          notes: 'Acabamento final da tampa'
        },
        quality: {
          tolerance: '±0.01mm',
          surfaceFinish: 'Ra 0.4',
          requirements: ['Verificar acabamento']
        },
        imageUrl: '/operation.png',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }
];

async function insertNewProjects() {
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db('simoldes');

    for (const project of newProjects) {
      const { operations, ...projectData } = project;
      
      // Verificar se o projeto já existe
      const existingProject = await db.collection('projects').findOne({ projectId: project.projectId });
      if (existingProject) {
        console.log(`⚠️  Projeto ${project.projectId} já existe, pulando...`);
        continue;
      }
      
      // Inserir o projeto
      const projectResult = await db.collection('projects').insertOne(projectData);
      console.log(`✅ Projeto inserido: ${project.name} (${project.projectId})`);

      // Inserir as operações do projeto
      const operationsWithProjectId = operations.map(operation => ({
        ...operation,
        projectId: projectResult.insertedId
      }));

      await db.collection('operations').insertMany(operationsWithProjectId);
      console.log(`✅ ${operations.length} operações inseridas para o projeto: ${project.name}`);
    }

    console.log('🎉 Inserção concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inserir projetos:', error);
  } finally {
    await client.close();
  }
}

insertNewProjects().catch(console.error); 