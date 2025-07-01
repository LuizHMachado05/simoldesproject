import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes';
const client = new MongoClient(uri);

async function createTestProject() {
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db('simoldes');

    // Criar novo projeto de teste
    const testProject = {
      projectId: 'TEST_001',
      name: 'PROJETO TESTE F1400',
      machine: 'F1400',
      programPath: 'U:/F1400/TEST_001',
      material: '1730',
      date: new Date(),
      programmer: 'teste.programador',
      blockCenter: 'X0,0 Y0,0',
      reference: 'EM Z: 15,0',
      observations: 'PROJETO PARA TESTE DE ASSINATURA',
      imageUrl: '/2d.png',
      status: 'in_progress',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Verificar se o projeto já existe
    const existingProject = await db.collection('projects').findOne({ projectId: testProject.projectId });
    if (existingProject) {
      console.log(`⚠️  Projeto ${testProject.projectId} já existe, removendo...`);
      await db.collection('projects').deleteOne({ projectId: testProject.projectId });
      await db.collection('operations').deleteMany({ projectId: existingProject._id });
    }

    // Inserir o projeto
    const projectResult = await db.collection('projects').insertOne(testProject);
    console.log(`✅ Projeto inserido: ${testProject.name} (${testProject.projectId})`);
    console.log(`   _id: ${projectResult.insertedId}`);

    // Criar operações de teste
    const testOperations = [
      {
        projectId: projectResult.insertedId,
        id: 1,
        sequence: '01',
        type: 'Furação',
        function: 'Furo guia',
        centerPoint: '45',
        toolRef: 'BK_DRILL_D20_SSD_701800011',
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
          notes: 'Furo inicial para guia'
        },
        quality: {
          tolerance: '±0.02mm',
          surfaceFinish: 'Ra 0.8',
          requirements: ['Verificar alinhamento']
        },
        imageUrl: '/2d.png',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        projectId: projectResult.insertedId,
        id: 2,
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
          requirements: ['Verificar profundidade']
        },
        imageUrl: '/2d.png',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        projectId: projectResult.insertedId,
        id: 3,
        sequence: '03',
        type: 'Fresamento',
        function: 'Acabamento',
        centerPoint: '40',
        toolRef: 'BK_FINISH_D25_SSD_701800033',
        ic: '180',
        alt: '195',
        time: {
          machine: '09:00:00',
          total: '09:30:00'
        },
        details: {
          depth: '75mm',
          speed: '3200 RPM',
          feed: '0.08mm/rev',
          coolant: 'Externa 50 bar',
          notes: 'Acabamento fino'
        },
        quality: {
          tolerance: '±0.01mm',
          surfaceFinish: 'Ra 0.4',
          requirements: ['Medir rugosidade']
        },
        imageUrl: '/2d.png',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Inserir operações
    const operationsResult = await db.collection('operations').insertMany(testOperations);
    console.log(`✅ ${operationsResult.insertedCount} operações inseridas`);

    // Verificar se foram criadas corretamente
    const createdOperations = await db.collection('operations').find({ 
      projectId: projectResult.insertedId 
    }).toArray();

    console.log('\n📋 Operações criadas:');
    createdOperations.forEach((op, index) => {
      console.log(`   ${index + 1}. ID: ${op.id}, Sequence: ${op.sequence}, Tipo: ${op.type}`);
      console.log(`      projectId: ${op.projectId} (tipo: ${typeof op.projectId})`);
    });

    console.log('\n🎯 Projeto de teste criado com sucesso!');
    console.log(`   ProjectId: ${testProject.projectId}`);
    console.log(`   _id: ${projectResult.insertedId}`);
    console.log(`   Operações: ${createdOperations.length}`);

  } catch (error) {
    console.error('❌ Erro ao criar projeto de teste:', error);
  } finally {
    await client.close();
  }
}

createTestProject(); 