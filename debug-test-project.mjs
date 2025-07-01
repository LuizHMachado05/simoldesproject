import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes';
const client = new MongoClient(uri);

async function debugTestProject() {
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db('simoldes');

    // Buscar o projeto TEST_001
    const project = await db.collection('projects').findOne({ projectId: 'TEST_001' });
    if (!project) {
      console.log('❌ Projeto TEST_001 não encontrado');
      return;
    }

    console.log(`✅ Projeto encontrado: ${project.name}`);
    console.log(`   ProjectId: ${project.projectId}`);
    console.log(`   _id: ${project._id} (tipo: ${typeof project._id})`);

    // Buscar operações com projectId como ObjectId
    const operationsWithObjectId = await db.collection('operations').find({ 
      projectId: project._id 
    }).toArray();

    console.log(`\n📋 Operações com projectId como ObjectId: ${operationsWithObjectId.length}`);
    operationsWithObjectId.forEach((op, index) => {
      console.log(`   ${index + 1}. ID: ${op.id}, Sequence: ${op.sequence}`);
      console.log(`      projectId: ${op.projectId} (tipo: ${typeof op.projectId})`);
    });

    // Buscar operações com projectId como string
    const operationsWithString = await db.collection('operations').find({ 
      projectId: project._id.toString() 
    }).toArray();

    console.log(`\n📋 Operações com projectId como string: ${operationsWithString.length}`);
    operationsWithString.forEach((op, index) => {
      console.log(`   ${index + 1}. ID: ${op.id}, Sequence: ${op.sequence}`);
      console.log(`      projectId: ${op.projectId} (tipo: ${typeof op.projectId})`);
    });

    // Buscar TODAS as operações para ver se há alguma
    const allOperations = await db.collection('operations').find({}).toArray();
    console.log(`\n📋 Total de operações no banco: ${allOperations.length}`);

    // Verificar se há operações com projectId parecido
    const similarOperations = allOperations.filter(op => 
      String(op.projectId).includes('686321cd33207175695c643c')
    );

    console.log(`\n📋 Operações com projectId similar: ${similarOperations.length}`);
    similarOperations.forEach((op, index) => {
      console.log(`   ${index + 1}. ID: ${op.id}, Sequence: ${op.sequence}`);
      console.log(`      projectId: ${op.projectId} (tipo: ${typeof op.projectId})`);
    });

    // Testar filtro específico
    if (operationsWithObjectId.length > 0) {
      const firstOp = operationsWithObjectId[0];
      console.log(`\n🧪 Testando filtro específico para operação ID: ${firstOp.id}, Sequence: ${firstOp.sequence}`);
      
      const testFilter = {
        projectId: project._id,
        $or: [
          { id: firstOp.id },
          { id: String(firstOp.id) },
          { sequence: String(firstOp.id) },
          { sequence: firstOp.id },
          { sequence: String(firstOp.id).padStart(2, '0') }
        ]
      };

      console.log('Filtro:', JSON.stringify(testFilter, null, 2));
      
      const foundOperation = await db.collection('operations').findOne(testFilter);
      console.log(`Operação encontrada: ${!!foundOperation}`);
      
      if (foundOperation) {
        console.log(`   _id: ${foundOperation._id}`);
        console.log(`   id: ${foundOperation.id}, sequence: ${foundOperation.sequence}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

debugTestProject(); 