// Script para preencher projetos e operações com dados fictícios
const { connect } = require('../../api/db/mongodb');

const fakeProjectData = {
  programPath: 'U:/F1400/FAKE_PROJECT',
  material: 'Aço 1045',
  programmer: 'joao.silva',
  blockCenter: 'X0,0 Y0,0',
  reference: 'EM Z: 10,0',
  observations: 'Observação fictícia',
  imageUrl: '/fake-image.png',
  status: 'in_progress',
  completedDate: new Date('2024-01-01T10:00:00Z'),
  totalTime: 123.45,
  createdAt: new Date('2024-01-01T09:00:00Z'),
  updatedAt: new Date('2024-01-01T11:00:00Z'),
};

const fakeProcessFields = {
  'Programa': 'FAKE_PROG',
  'Tipo Percurso': 'Desbaste',
  'Ref.': 'REF-123',
  'Comentário': 'Comentário fictício',
  'Ø RC': '10',
  'Ferramenta': 'Fresa 12mm',
  'Rib.': 'RIB-1',
  'Alt.': 'ALT-1',
  'Z min': '5',
  'Lat.2D': 'LAT-2D',
  'Sob. Esp.': 'SOB-ESP',
  'Passo Lat.': '1.5',
  'Passo Vert.': '2.0',
  'Tol.': '±0.01',
  'Rot.': '3000',
  'Av.': '0.2',
  'Ângulo': '45',
  'Plano Trab.': 'XY',
  'Tempo Corte': '00:10:00',
  'Tempo Total': '00:15:00',
  'Medição': 'OK',
  'Rubrica': 'JS',
  'Fresa': 'FRESA-FAKE',
  'Sup.': 'SUP-1',
};

async function main() {
  const db = await connect();
  // Atualizar projetos
  const projects = await db.collection('projects').find({}).toArray();
  let updatedProjects = 0;
  for (const project of projects) {
    let update = {};
    for (const key in fakeProjectData) {
      if (!(key in project) || project[key] === '' || project[key] === undefined || project[key] === null) {
        update[key] = fakeProjectData[key];
      }
    }
    if (Object.keys(update).length > 0) {
      await db.collection('projects').updateOne({ _id: project._id }, { $set: update });
      updatedProjects++;
      console.log(`Projeto ${project.projectId || project._id}: campos fictícios preenchidos.`);
    }
  }
  // Atualizar operações
  const operations = await db.collection('operations').find({}).toArray();
  let updatedOps = 0;
  for (const op of operations) {
    let changed = false;
    for (const key in fakeProcessFields) {
      if (!(key in op) || op[key] === '' || op[key] === undefined || op[key] === null) {
        op[key] = fakeProcessFields[key];
        changed = true;
      }
    }
    if (changed) {
      await db.collection('operations').replaceOne({ _id: op._id }, op);
      updatedOps++;
      console.log(`Operação ${op._id}: campos da folha de processo preenchidos.`);
    }
  }
  console.log(`Total de projetos atualizados: ${updatedProjects}`);
  console.log(`Total de operações atualizadas: ${updatedOps}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Erro ao preencher dados fictícios:', err);
  process.exit(1);
}); 