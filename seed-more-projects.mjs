import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes';
const client = new MongoClient(uri);

const now = new Date();

const projects = [
  {
    projectId: '2001_A',
    name: 'MOLDE BASE INFERIOR',
    machine: 'F1200',
    programPath: 'U:/F1200/2001_A',
    material: '1740',
    date: new Date('2025-07-01T08:00:00Z'),
    programmer: 'ana.santos',
    blockCenter: 'X0,0 Y0,0',
    reference: 'EM Z: 10,0',
    observations: 'USAR SUPORTE ESPECIAL',
    imageUrl: '/programCapa.png',
    status: 'in_progress',
    createdAt: now,
    updatedAt: now
  },
  {
    projectId: '2002_B',
    name: 'MOLDE TAMPA LATERAL',
    machine: 'F1300',
    programPath: 'U:/F1300/2002_B',
    material: '1730',
    date: new Date('2025-07-02T08:00:00Z'),
    programmer: 'carlos.silva',
    blockCenter: 'X0,0 Y0,0',
    reference: 'EM Z: 20,0',
    observations: 'VERIFICAR ALINHAMENTO',
    imageUrl: '/programCapa.png',
    status: 'in_progress',
    createdAt: now,
    updatedAt: now
  }
];

const operationsByProject = [
  [ // Para o projeto 1
    {
      sequence: '01',
      id: 1,
      type: 'Furação',
      function: 'Pré-furo',
      centerPoint: '40',
      toolRef: 'BK_DRILL_D32_SSD_701800044',
      ic: '220',
      alt: '245',
      time: { machine: '11:00:00', total: '11:45:20' },
      details: { depth: '75mm', speed: '2900 RPM', feed: '0.10mm/rev', coolant: 'Interna 60 bar', notes: 'Furo inicial' },
      quality: { tolerance: '±0.02mm', surfaceFinish: 'Ra 0.8', requirements: ['Verificar circularidade'] },
      imageUrl: '/operation.png',
      completed: false,
      createdAt: now,
      updatedAt: now
    },
    {
      sequence: '02',
      id: 2,
      type: 'Fresamento',
      function: 'Desbaste',
      centerPoint: '52',
      toolRef: 'BK_MILL_D63_SSD_701800022',
      ic: '280',
      alt: '295',
      time: { machine: '09:30:00', total: '09:45:15' },
      details: { depth: '85mm', speed: '2800 RPM', feed: '0.18mm/rev', coolant: 'Externa 45 bar', notes: 'Desbaste rápido' },
      quality: { tolerance: '±0.05mm', surfaceFinish: 'Ra 1.6', requirements: ['Verificar profundidade'] },
      imageUrl: '/operation.png',
      completed: false,
      createdAt: now,
      updatedAt: now
    }
  ],
  [ // Para o projeto 2
    {
      sequence: '01',
      id: 1,
      type: 'Furação',
      function: 'Centro',
      centerPoint: '48',
      toolRef: 'BK_TOPDRIL_D44_SSD_701800011',
      ic: '247',
      alt: '273',
      time: { machine: '10:30:12', total: '10:38:15' },
      details: { depth: '120mm', speed: '2400 RPM', feed: '0.15mm/rev', coolant: 'Externa 40 bar', notes: 'Verificar alinhamento antes de iniciar' },
      quality: { tolerance: '±0.008mm', surfaceFinish: 'Ra 0.2', requirements: ['Verificar concentricidade', 'Medir circularidade'] },
      imageUrl: '/operation.png',
      completed: false,
      createdAt: now,
      updatedAt: now
    },
    {
      sequence: '02',
      id: 2,
      type: 'Fresamento',
      function: 'Acabamento',
      centerPoint: '35',
      toolRef: 'BK_FINISH_D25_SSD_701800033',
      ic: '180',
      alt: '195',
      time: { machine: '14:15:00', total: '14:45:30' },
      details: { depth: '65mm', speed: '3200 RPM', feed: '0.08mm/rev', coolant: 'Externa 50 bar', notes: 'Acabamento fino' },
      quality: { tolerance: '±0.01mm', surfaceFinish: 'Ra 0.4', requirements: ['Medir rugosidade'] },
      imageUrl: '/operation.png',
      completed: false,
      createdAt: now,
      updatedAt: now
    }
  ]
];

async function seed() {
  try {
    await client.connect();
    const db = client.db('simoldes');
    const projectsCol = db.collection('projects');
    const operationsCol = db.collection('operations');

    // Inserir projetos
    const insertedProjects = [];
    for (const proj of projects) {
      const result = await projectsCol.insertOne(proj);
      insertedProjects.push(result.insertedId);
      console.log(`Projeto inserido: ${proj.projectId}`);
    }

    // Inserir operações para cada projeto
    for (let i = 0; i < insertedProjects.length; i++) {
      const projectId = insertedProjects[i];
      for (const op of operationsByProject[i]) {
        op.projectId = projectId;
        await operationsCol.insertOne(op);
        console.log(`  Operação inserida: ${op.sequence} para projeto ${projects[i].projectId}`);
      }
    }
    console.log('✅ Seed concluído!');
  } catch (err) {
    console.error('Erro ao inserir dados:', err);
  } finally {
    await client.close();
  }
}

seed(); 