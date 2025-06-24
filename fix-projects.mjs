import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes';
const client = new MongoClient(uri);

const now = new Date();

// Projetos apenas para máquinas existentes
const projects = [
  {
    projectId: '2003_C',
    name: 'MOLDE SUPORTE SUPERIOR',
    machine: 'F1400', // Máquina existente
    programPath: 'U:/F1400/2003_C',
    material: '1730',
    date: new Date('2025-07-03T08:00:00Z'),
    programmer: 'diego.verciano',
    blockCenter: 'X0,0 Y0,0',
    reference: 'EM Z: 15,0',
    observations: 'VERIFICAR ALINHAMENTO INICIAL',
    imageUrl: '/programCapa.png',
    status: 'in_progress',
    createdAt: now,
    updatedAt: now
  },
  {
    projectId: '2004_D',
    name: 'MOLDE CONEXÃO LATERAL',
    machine: 'F1400', // Máquina existente
    programPath: 'U:/F1400/2004_D',
    material: '1740',
    date: new Date('2025-07-04T08:00:00Z'),
    programmer: 'ana.santos',
    blockCenter: 'X0,0 Y0,0',
    reference: 'EM Z: 25,0',
    observations: 'USAR SUPORTE ESPECIAL',
    imageUrl: '/programCapa.png',
    status: 'in_progress',
    createdAt: now,
    updatedAt: now
  },
  {
    projectId: '2005_E',
    name: 'EIXO PRINCIPAL',
    machine: 'T2500', // Máquina existente
    programPath: 'U:/T2500/2005_E',
    material: '1730',
    date: new Date('2025-07-05T08:00:00Z'),
    programmer: 'carlos.silva',
    blockCenter: 'X0,0 Y0,0',
    reference: 'EM Z: 30,0',
    observations: 'VERIFICAR CONCENTRICIDADE',
    imageUrl: '/programCapa.png',
    status: 'in_progress',
    createdAt: now,
    updatedAt: now
  },
  {
    projectId: '2006_F',
    name: 'MANCAL CENTRAL',
    machine: 'T2500', // Máquina existente
    programPath: 'U:/T2500/2006_F',
    material: '1740',
    date: new Date('2025-07-06T08:00:00Z'),
    programmer: 'diego.verciano',
    blockCenter: 'X0,0 Y0,0',
    reference: 'EM Z: 20,0',
    observations: 'CONTROLE RIGOROSO DE TOLERÂNCIA',
    imageUrl: '/programCapa.png',
    status: 'in_progress',
    createdAt: now,
    updatedAt: now
  }
];

// 3 operações para cada projeto
const operationsByProject = [
  [ // Para o projeto 1 (F1400)
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
    },
    {
      sequence: '03',
      id: 3,
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
  ],
  [ // Para o projeto 2 (F1400)
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
      details: { depth: '120mm', speed: '2400 RPM', feed: '0.15mm/rev', coolant: 'Externa 40 bar', notes: 'Verificar alinhamento' },
      quality: { tolerance: '±0.008mm', surfaceFinish: 'Ra 0.2', requirements: ['Verificar concentricidade'] },
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
      centerPoint: '55',
      toolRef: 'BK_ROUGH_D63_SSD_701800078',
      ic: '280',
      alt: '305',
      time: { machine: '13:30:00', total: '14:15:00' },
      details: { depth: '95mm', speed: '2200 RPM', feed: '0.18mm/rev', coolant: 'Externa 55 bar', notes: 'Desbaste em 3 passes' },
      quality: { tolerance: '±0.05mm', surfaceFinish: 'Ra 1.6', requirements: ['Verificar profundidade'] },
      imageUrl: '/operation.png',
      completed: false,
      createdAt: now,
      updatedAt: now
    },
    {
      sequence: '03',
      id: 3,
      type: 'Fresamento',
      function: 'Acabamento',
      centerPoint: '38',
      toolRef: 'BK_FINISH_D32_SSD_701800045',
      ic: '190',
      alt: '215',
      time: { machine: '10:00:00', total: '10:45:00' },
      details: { depth: '55mm', speed: '3500 RPM', feed: '0.08mm/rev', coolant: 'Externa 50 bar', notes: 'Acabamento lateral' },
      quality: { tolerance: '±0.01mm', surfaceFinish: 'Ra 0.4', requirements: ['Medir planicidade'] },
      imageUrl: '/operation.png',
      completed: false,
      createdAt: now,
      updatedAt: now
    }
  ],
  [ // Para o projeto 3 (T2500)
    {
      sequence: '01',
      id: 1,
      type: 'Furação',
      function: 'Pré-furo',
      centerPoint: '42',
      toolRef: 'BK_DRILL_D38_SSD_701800022',
      ic: '235',
      alt: '260',
      time: { machine: '09:15:00', total: '09:45:30' },
      details: { depth: '85mm', speed: '2800 RPM', feed: '0.12mm/rev', coolant: 'Externa 45 bar', notes: 'Furo inicial' },
      quality: { tolerance: '±0.02mm', surfaceFinish: 'Ra 0.8', requirements: ['Verificar circularidade'] },
      imageUrl: '/operation.png',
      completed: false,
      createdAt: now,
      updatedAt: now
    },
    {
      sequence: '02',
      id: 2,
      type: 'Furação',
      function: 'Alargamento',
      centerPoint: '45',
      toolRef: 'BK_REAMER_D40_SSD_701800055',
      ic: '180',
      alt: '200',
      time: { machine: '11:30:00', total: '12:00:00' },
      details: { depth: '80mm', speed: '1500 RPM', feed: '0.05mm/rev', coolant: 'Externa 50 bar', notes: 'Alargamento preciso' },
      quality: { tolerance: '±0.005mm', surfaceFinish: 'Ra 0.1', requirements: ['Medir diâmetro'] },
      imageUrl: '/operation.png',
      completed: false,
      createdAt: now,
      updatedAt: now
    },
    {
      sequence: '03',
      id: 3,
      type: 'Furação',
      function: 'Rosqueamento',
      centerPoint: '38',
      toolRef: 'BK_TAP_M12_SSD_701800066',
      ic: '120',
      alt: '140',
      time: { machine: '14:00:00', total: '14:30:00' },
      details: { depth: '25mm', speed: '800 RPM', feed: '1.75mm/rev', coolant: 'Externa 40 bar', notes: 'Rosqueamento M12' },
      quality: { tolerance: '±0.01mm', surfaceFinish: 'Ra 0.2', requirements: ['Verificar rosca'] },
      imageUrl: '/operation.png',
      completed: false,
      createdAt: now,
      updatedAt: now
    }
  ],
  [ // Para o projeto 4 (T2500)
    {
      sequence: '01',
      id: 1,
      type: 'Furação',
      function: 'Centro',
      centerPoint: '50',
      toolRef: 'BK_CENTER_D10_SSD_701800077',
      ic: '150',
      alt: '170',
      time: { machine: '08:00:00', total: '08:15:00' },
      details: { depth: '15mm', speed: '2000 RPM', feed: '0.08mm/rev', coolant: 'Externa 35 bar', notes: 'Centro inicial' },
      quality: { tolerance: '±0.01mm', surfaceFinish: 'Ra 0.4', requirements: ['Verificar posição'] },
      imageUrl: '/operation.png',
      completed: false,
      createdAt: now,
      updatedAt: now
    },
    {
      sequence: '02',
      id: 2,
      type: 'Furação',
      function: 'Furação',
      centerPoint: '48',
      toolRef: 'BK_DRILL_D25_SSD_701800088',
      ic: '200',
      alt: '220',
      time: { machine: '09:00:00', total: '09:45:00' },
      details: { depth: '60mm', speed: '2500 RPM', feed: '0.15mm/rev', coolant: 'Externa 45 bar', notes: 'Furação principal' },
      quality: { tolerance: '±0.02mm', surfaceFinish: 'Ra 0.8', requirements: ['Verificar profundidade'] },
      imageUrl: '/operation.png',
      completed: false,
      createdAt: now,
      updatedAt: now
    },
    {
      sequence: '03',
      id: 3,
      type: 'Furação',
      function: 'Acabamento',
      centerPoint: '52',
      toolRef: 'BK_FINISH_D26_SSD_701800099',
      ic: '180',
      alt: '200',
      time: { machine: '10:30:00', total: '11:15:00' },
      details: { depth: '58mm', speed: '3000 RPM', feed: '0.08mm/rev', coolant: 'Externa 50 bar', notes: 'Acabamento interno' },
      quality: { tolerance: '±0.01mm', surfaceFinish: 'Ra 0.4', requirements: ['Medir diâmetro final'] },
      imageUrl: '/operation.png',
      completed: false,
      createdAt: now,
      updatedAt: now
    }
  ]
];

async function fixProjects() {
  try {
    await client.connect();
    const db = client.db('simoldes');
    const projectsCol = db.collection('projects');
    const operationsCol = db.collection('operations');

    // Remover projetos incorretos (F1200, F1300)
    const deleteResult = await projectsCol.deleteMany({
      machine: { $in: ['F1200', 'F1300'] }
    });
    console.log(`Removidos ${deleteResult.deletedCount} projetos incorretos`);

    // Remover operações dos projetos incorretos
    const projectsToDelete = await projectsCol.find({
      machine: { $in: ['F1200', 'F1300'] }
    }).toArray();
    
    for (const project of projectsToDelete) {
      await operationsCol.deleteMany({ projectId: project._id });
    }

    // Inserir novos projetos
    const insertedProjects = [];
    for (const proj of projects) {
      const result = await projectsCol.insertOne(proj);
      insertedProjects.push(result.insertedId);
      console.log(`Projeto inserido: ${proj.projectId} (${proj.machine})`);
    }

    // Inserir operações para cada projeto
    for (let i = 0; i < insertedProjects.length; i++) {
      const projectId = insertedProjects[i];
      for (const op of operationsByProject[i]) {
        op.projectId = projectId;
        await operationsCol.insertOne(op);
        console.log(`  Operação ${op.sequence} inserida para projeto ${projects[i].projectId}`);
      }
    }
    
    console.log('✅ Projetos corrigidos com sucesso!');
    
    // Verificar resultado
    const finalProjects = await projectsCol.find({}).toArray();
    console.log(`\nTotal de projetos no banco: ${finalProjects.length}`);
    finalProjects.forEach(p => {
      console.log(`- ${p.projectId}: ${p.name} (${p.machine})`);
    });
    
  } catch (err) {
    console.error('Erro ao corrigir projetos:', err);
  } finally {
    await client.close();
  }
}

fixProjects(); 