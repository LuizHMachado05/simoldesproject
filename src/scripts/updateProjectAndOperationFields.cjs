// Script para garantir todos os campos em projetos e operações
const { connect } = require('../../api/db/mongodb');

const PROJECT_FIELDS = {
  projectId: '',
  name: '',
  machine: '',
  date: new Date(),
  programPath: undefined, // string
  material: undefined, // string
  programmer: undefined, // string
  blockCenter: undefined, // string
  reference: undefined, // string
  observations: undefined, // string
  imageUrl: undefined, // string
  status: undefined, // 'in_progress' | 'completed'
  completedDate: undefined, // Date
  totalTime: undefined, // number
  createdAt: undefined, // Date
  updatedAt: undefined, // Date
};

const OPERATION_FIELDS = {
  id: null,
  sequence: '',
  type: '',
  function: '',
  centerPoint: '',
  toolRef: '',
  ic: '',
  alt: '',
  time: { machine: '', total: '' },
  details: { depth: '', speed: '', feed: '', coolant: '', notes: '' },
  quality: { tolerance: '', surfaceFinish: '', requirements: [] },
  measurements: { required: [], actual: [] },
  execution: { startTime: '', endTime: '', duration: '', operator: '' },
  completed: false,
  signedBy: '',
  machineId: '',
  timestamp: '',
  inspectionNotes: '',
  timeRecord: { start: '', end: '' },
  measurementValue: '',
  imageUrl: '',
  // Novos campos folha de processo
  'Programa': '',
  'Tipo Percurso': '',
  'Ref.': '',
  'Comentário': '',
  'Ø RC': '',
  'Ferramenta': '',
  'Rib.': '',
  'Alt.': '',
  'Z min': '',
  'Lat.2D': '',
  'Sob. Esp.': '',
  'Passo Lat.': '',
  'Passo Vert.': '',
  'Tol.': '',
  'Rot.': '',
  'Av.': '',
  'Ângulo': '',
  'Plano Trab.': '',
  'Tempo Corte': '',
  'Tempo Total': '',
  'Medição': '',
  'Rubrica': '',
  'Fresa': '',
  'Sup.': '',
};

function ensureFields(obj, fields) {
  for (const key in fields) {
    if (!(key in obj) || obj[key] === undefined) {
      obj[key] = fields[key];
    } else if (typeof fields[key] === 'object' && fields[key] !== null && !Array.isArray(fields[key])) {
      // Recursivo para objetos
      obj[key] = ensureFields(obj[key] || {}, fields[key]);
    }
  }
  return obj;
}

function ensureProjectFields(project) {
  let updated = false;
  // Campos obrigatórios
  if (typeof project.projectId !== 'string') {
    project.projectId = '';
    updated = true;
    console.log(`Projeto ${project._id}: campo 'projectId' corrigido/adicionado.`);
  }
  if (typeof project.name !== 'string') {
    project.name = '';
    updated = true;
    console.log(`Projeto ${project._id}: campo 'name' corrigido/adicionado.`);
  }
  if (typeof project.machine !== 'string') {
    project.machine = '';
    updated = true;
    console.log(`Projeto ${project._id}: campo 'machine' corrigido/adicionado.`);
  }
  if (!(project.date instanceof Date)) {
    project.date = new Date();
    updated = true;
    console.log(`Projeto ${project._id}: campo 'date' corrigido/adicionado.`);
  }
  // Campos opcionais
  if ('programPath' in project && typeof project.programPath !== 'string') {
    project.programPath = '';
    updated = true;
    console.log(`Projeto ${project._id}: campo 'programPath' corrigido.`);
  }
  if ('material' in project && typeof project.material !== 'string') {
    project.material = '';
    updated = true;
    console.log(`Projeto ${project._id}: campo 'material' corrigido.`);
  }
  if ('programmer' in project && typeof project.programmer !== 'string') {
    project.programmer = '';
    updated = true;
    console.log(`Projeto ${project._id}: campo 'programmer' corrigido.`);
  }
  if ('blockCenter' in project && typeof project.blockCenter !== 'string') {
    project.blockCenter = '';
    updated = true;
    console.log(`Projeto ${project._id}: campo 'blockCenter' corrigido.`);
  }
  if ('reference' in project && typeof project.reference !== 'string') {
    project.reference = '';
    updated = true;
    console.log(`Projeto ${project._id}: campo 'reference' corrigido.`);
  }
  if ('observations' in project && typeof project.observations !== 'string') {
    project.observations = '';
    updated = true;
    console.log(`Projeto ${project._id}: campo 'observations' corrigido.`);
  }
  if ('imageUrl' in project && typeof project.imageUrl !== 'string') {
    project.imageUrl = '';
    updated = true;
    console.log(`Projeto ${project._id}: campo 'imageUrl' corrigido.`);
  }
  if ('status' in project && project.status !== 'in_progress' && project.status !== 'completed') {
    project.status = 'in_progress';
    updated = true;
    console.log(`Projeto ${project._id}: campo 'status' corrigido.`);
  }
  if ('completedDate' in project && !(project.completedDate instanceof Date)) {
    project.completedDate = new Date();
    updated = true;
    console.log(`Projeto ${project._id}: campo 'completedDate' corrigido.`);
  }
  if ('totalTime' in project && typeof project.totalTime !== 'number') {
    project.totalTime = 0;
    updated = true;
    console.log(`Projeto ${project._id}: campo 'totalTime' corrigido.`);
  }
  if ('createdAt' in project && !(project.createdAt instanceof Date)) {
    project.createdAt = new Date();
    updated = true;
    console.log(`Projeto ${project._id}: campo 'createdAt' corrigido.`);
  }
  if ('updatedAt' in project && !(project.updatedAt instanceof Date)) {
    project.updatedAt = new Date();
    updated = true;
    console.log(`Projeto ${project._id}: campo 'updatedAt' corrigido.`);
  }
  return updated;
}

async function main() {
  const db = await connect();
  const projects = await db.collection('projects').find({}).toArray();
  console.log(`Projetos encontrados: ${projects.length}`);
  let updatedCount = 0;

  for (const project of projects) {
    let updated = false;
    // Atualiza campos do projeto conforme schema
    if (ensureProjectFields(project)) {
      updated = true;
    }
    // Atualiza operações
    if (Array.isArray(project.operations)) {
      for (let i = 0; i < project.operations.length; i++) {
        const op = project.operations[i];
        const newOp = ensureFields(op, OPERATION_FIELDS);
        if (JSON.stringify(op) !== JSON.stringify(newOp)) {
          project.operations[i] = newOp;
          updated = true;
          console.log(`Projeto ${project.projectId || project._id}, operação ${op.sequence || i}: campos atualizados.`);
        }
      }
    }
    if (updated) {
      await db.collection('projects').updateOne({ _id: project._id }, { $set: project });
      updatedCount++;
    }
  }
  if (updatedCount > 0) {
    console.log(`Atualização concluída. Projetos modificados: ${updatedCount}`);
  } else {
    console.log('Nenhum projeto precisou ser atualizado. Todos os campos já estavam presentes ou válidos.');
  }
  process.exit(0);
}

main().catch(err => {
  console.error('Erro ao atualizar projetos:', err);
  process.exit(1);
}); 