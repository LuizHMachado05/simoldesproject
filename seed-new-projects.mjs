import { MongoClient, ObjectId } from 'mongodb';

const uri = "mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes";
const client = new MongoClient(uri);

async function seedNewProjects() {
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db('simoldes');

    // Dados dos novos projetos
    const newProjects = [
      {
        projectId: '1671_32',
        name: 'MOLDE CARCAÇA TRASEIRA',
        machine: 'F1400',
        programPath: 'U:/F1400/1671_32',
        material: '1730',
        date: new Date('2024-02-20'),
        programmer: 'diego.verciano',
        blockCenter: 'X0,0 Y0,0',
        reference: 'EM Z: 18,0',
        observations: 'VERIFICAR ALINHAMENTO COM GABARITO',
        imageUrl: '/2d.png',
        status: 'in_progress',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        projectId: '1672_33',
        name: 'MOLDE TAMPA INFERIOR',
        machine: 'F1600',
        programPath: 'U:/F1600/1672_33',
        material: '1740',
        date: new Date('2024-02-22'),
        programmer: 'ana.santos',
        blockCenter: 'X0,0 Y0,0',
        reference: 'EM Z: 28,0',
        observations: 'USAR SUPORTE ESPECIAL PARA TAMPA',
        imageUrl: '/2d.png',
        status: 'in_progress',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        projectId: '1673_34',
        name: 'MOLDE CAVIDADE LATERAL',
        machine: 'F1400',
        programPath: 'U:/F1400/1673_34',
        material: '1730',
        date: new Date('2024-02-25'),
        programmer: 'pedro.oliveira',
        blockCenter: 'X0,0 Y0,0',
        reference: 'EM Z: 22,0',
        observations: 'REFRIGERAÇÃO ESPECIAL REQUERIDA',
        imageUrl: '/2d.png',
        status: 'in_progress',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Inserir projetos
    console.log('Inserindo projetos...');
    const projectsResult = await db.collection('projects').insertMany(newProjects);
    console.log(`${projectsResult.insertedCount} projetos inseridos com sucesso!`);

    // Dados das operações para cada projeto
    const operations = [
      // Operações para o projeto 1671_32 (MOLDE CARCAÇA TRASEIRA)
      {
        projectId: projectsResult.insertedIds[0],
        sequence: '01',
        type: 'Furação',
        function: 'Centro',
        centerPoint: '45',
        toolRef: 'BK_TOPDRIL_D40_SSD_701800011',
        ic: '220',
        alt: '245',
        time: {
          machine: '08:00:00',
          total: '08:15:30'
        },
        details: {
          depth: '100mm',
          speed: '2500 RPM',
          feed: '0.12mm/rev',
          coolant: 'Externa 45 bar',
          notes: 'Verificar concentricidade antes de iniciar'
        },
        quality: {
          tolerance: '±0.01mm',
          surfaceFinish: 'Ra 0.4',
          requirements: ['Verificar circularidade', 'Medir profundidade']
        },
        imageUrl: '/2d.png',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        projectId: projectsResult.insertedIds[0],
        sequence: '02',
        type: 'Fresamento',
        function: 'Desbaste',
        centerPoint: '52',
        toolRef: 'BK_MILL_D63_SSD_701800022',
        ic: '280',
        alt: '295',
        time: {
          machine: '08:30:00',
          total: '09:00:00'
        },
        details: {
          depth: '75mm',
          speed: '2800 RPM',
          feed: '0.18mm/rev',
          coolant: 'Externa 50 bar',
          notes: 'Desbaste em 2 passes'
        },
        quality: {
          tolerance: '±0.05mm',
          surfaceFinish: 'Ra 1.6',
          requirements: ['Verificar profundidade entre passes']
        },
        imageUrl: '/2d.png',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        projectId: projectsResult.insertedIds[0],
        sequence: '03',
        type: 'Fresamento',
        function: 'Acabamento',
        centerPoint: '38',
        toolRef: 'BK_FINISH_D25_SSD_701800033',
        ic: '180',
        alt: '195',
        time: {
          machine: '09:15:00',
          total: '09:45:00'
        },
        details: {
          depth: '75mm',
          speed: '3200 RPM',
          feed: '0.08mm/rev',
          coolant: 'Externa 55 bar',
          notes: 'Acabamento fino nas paredes'
        },
        quality: {
          tolerance: '±0.01mm',
          surfaceFinish: 'Ra 0.4',
          requirements: ['Medir rugosidade', 'Verificar paralelismo']
        },
        imageUrl: '/2d.png',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Operações para o projeto 1672_33 (MOLDE TAMPA INFERIOR)
      {
        projectId: projectsResult.insertedIds[1],
        sequence: '01',
        type: 'Furação',
        function: 'Pré-furo',
        centerPoint: '48',
        toolRef: 'BK_DRILL_D35_SSD_701800044',
        ic: '240',
        alt: '265',
        time: {
          machine: '10:00:00',
          total: '10:30:00'
        },
        details: {
          depth: '90mm',
          speed: '2600 RPM',
          feed: '0.10mm/rev',
          coolant: 'Interna 60 bar',
          notes: 'Controle dimensional crítico'
        },
        quality: {
          tolerance: '±0.008mm',
          surfaceFinish: 'Ra 0.2',
          requirements: ['Verificar concentricidade', 'Medir circularidade']
        },
        imageUrl: '/2d.png',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        projectId: projectsResult.insertedIds[1],
        sequence: '02',
        type: 'Fresamento',
        function: 'Desbaste Base',
        centerPoint: '60',
        toolRef: 'BK_MILL_D80_SSD_701800055',
        ic: '320',
        alt: '340',
        time: {
          machine: '10:45:00',
          total: '11:15:00'
        },
        details: {
          depth: '50mm',
          speed: '2200 RPM',
          feed: '0.20mm/rev',
          coolant: 'Externa 55 bar',
          notes: 'Desbaste em 3 passes'
        },
        quality: {
          tolerance: '±0.03mm',
          surfaceFinish: 'Ra 1.2',
          requirements: ['Verificar planicidade', 'Medir espessura']
        },
        imageUrl: '/2d.png',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        projectId: projectsResult.insertedIds[1],
        sequence: '03',
        type: 'Fresamento',
        function: 'Acabamento',
        centerPoint: '42',
        toolRef: 'BK_FINISH_D30_SSD_701800066',
        ic: '200',
        alt: '215',
        time: {
          machine: '11:30:00',
          total: '12:00:00'
        },
        details: {
          depth: '50mm',
          speed: '3000 RPM',
          feed: '0.06mm/rev',
          coolant: 'Externa 60 bar',
          notes: 'Acabamento fino na base'
        },
        quality: {
          tolerance: '±0.008mm',
          surfaceFinish: 'Ra 0.2',
          requirements: ['Medir rugosidade', 'Verificar planicidade']
        },
        imageUrl: '/2d.png',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Operações para o projeto 1673_34 (MOLDE CAVIDADE LATERAL)
      {
        projectId: projectsResult.insertedIds[2],
        sequence: '01',
        type: 'Furação',
        function: 'Furos de refrigeração',
        centerPoint: '35',
        toolRef: 'BK_DRILL_D15_SSD_701800077',
        ic: '180',
        alt: '205',
        time: {
          machine: '13:00:00',
          total: '13:30:00'
        },
        details: {
          depth: '120mm',
          speed: '3500 RPM',
          feed: '0.08mm/rev',
          coolant: 'Interna 70 bar',
          notes: 'Furos de refrigeração críticos'
        },
        quality: {
          tolerance: '±0.02mm',
          surfaceFinish: 'Ra 0.8',
          requirements: ['Verificar profundidade', 'Medir circularidade']
        },
        imageUrl: '/2d.png',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        projectId: projectsResult.insertedIds[2],
        sequence: '02',
        type: 'Fresamento',
        function: 'Desbaste cavidade',
        centerPoint: '55',
        toolRef: 'BK_MILL_D70_SSD_701800088',
        ic: '300',
        alt: '320',
        time: {
          machine: '13:45:00',
          total: '14:30:00'
        },
        details: {
          depth: '85mm',
          speed: '2400 RPM',
          feed: '0.15mm/rev',
          coolant: 'Externa 65 bar',
          notes: 'Desbaste da cavidade em 4 passes'
        },
        quality: {
          tolerance: '±0.05mm',
          surfaceFinish: 'Ra 1.6',
          requirements: ['Verificar profundidade', 'Monitorar temperatura']
        },
        imageUrl: '/2d.png',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        projectId: projectsResult.insertedIds[2],
        sequence: '03',
        type: 'Fresamento',
        function: 'Acabamento cavidade',
        centerPoint: '40',
        toolRef: 'BK_FINISH_D20_SSD_701800099',
        ic: '160',
        alt: '175',
        time: {
          machine: '14:45:00',
          total: '15:30:00'
        },
        details: {
          depth: '85mm',
          speed: '4000 RPM',
          feed: '0.05mm/rev',
          coolant: 'Externa 70 bar',
          notes: 'Acabamento fino da cavidade'
        },
        quality: {
          tolerance: '±0.008mm',
          surfaceFinish: 'Ra 0.2',
          requirements: ['Medir rugosidade', 'Verificar geometria']
        },
        imageUrl: '/2d.png',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Inserir operações
    console.log('Inserindo operações...');
    const operationsResult = await db.collection('operations').insertMany(operations);
    console.log(`${operationsResult.insertedCount} operações inseridas com sucesso!`);

    // Listar projetos criados
    const createdProjects = await db.collection('projects').find({ 
      projectId: { $in: ['1671_32', '1672_33', '1673_34'] } 
    }).toArray();
    
    console.log('\nProjetos criados:');
    createdProjects.forEach(project => {
      console.log(`- ${project.name} (${project.projectId}) - Máquina: ${project.machine}`);
    });

    console.log('\nOperações criadas por projeto:');
    for (const project of createdProjects) {
      const projectOperations = await db.collection('operations').find({ 
        projectId: project._id 
      }).toArray();
      console.log(`\n${project.name} (${project.projectId}):`);
      projectOperations.forEach(op => {
        console.log(`  - Seq ${op.sequence}: ${op.type} - ${op.function}`);
      });
    }

  } catch (error) {
    console.error('Erro ao criar projetos e operações:', error);
  } finally {
    await client.close();
    console.log('\nConexão fechada');
  }
}

// Executar o script
seedNewProjects(); 