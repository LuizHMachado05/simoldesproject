import { MongoClient, ObjectId } from 'mongodb';

const uri = "mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes";
const client = new MongoClient(uri);

async function seedDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('simoldes');

    // Seed machines
    const machines = await seedMachines(db);
    console.log('Machines seeded');

    // Seed operators
    const operators = await seedOperators(db);
    console.log('Operators seeded');

    // Seed projects and operations
    await seedProjectsAndOperations(db, machines, operators);
    console.log('Projects and operations seeded');

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

async function seedMachines(db) {
  const machines = [
    {
      machineId: 'F1400',
      name: 'Fresadora 1400',
      password: 'f1400pass', // Em produção, usar hash
      status: 'active',
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      machineId: 'F1600',
      name: 'Fresadora 1600',
      password: 'f1600pass', // Em produção, usar hash
      status: 'active',
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await db.collection('machines').deleteMany({});
  const result = await db.collection('machines').insertMany(machines);
  return result.insertedIds;
}

async function seedOperators(db) {
  const operators = [
    {
      name: 'João Silva',
      code: 'JS001',
      role: 'operator',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Maria Santos',
      code: 'MS001',
      role: 'supervisor',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Carlos Oliveira',
      code: 'CO001',
      role: 'admin',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await db.collection('operators').deleteMany({});
  const result = await db.collection('operators').insertMany(operators);
  return result.insertedIds;
}

async function seedProjectsAndOperations(db, machines, operators) {
  const projects = [
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
      updatedAt: new Date()
    }
  ];

  await db.collection('projects').deleteMany({});
  const projectsResult = await db.collection('projects').insertMany(projects);

  const operations = [
    {
      projectId: projectsResult.insertedIds[0],
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
  ];

  await db.collection('operations').deleteMany({});
  await db.collection('operations').insertMany(operations);

  // Clear and seed operation logs
  await db.collection('operationLogs').deleteMany({});
}

// Run the seeding
seedDatabase().catch(console.error); 