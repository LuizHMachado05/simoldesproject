// Script para garantir campos da folha de processo em operations
const { connect } = require('../../api/db/mongodb');

const PROCESS_FIELDS = [
  'Programa',
  'Tipo Percurso',
  'Ref.',
  'Comentário',
  'Ø RC',
  'Ferramenta',
  'Rib.',
  'Alt.',
  'Z min',
  'Lat.2D',
  'Sob. Esp.',
  'Passo Lat.',
  'Passo Vert.',
  'Tol.',
  'Rot.',
  'Av.',
  'Ângulo',
  'Plano Trab.',
  'Tempo Corte',
  'Tempo Total',
  'Medição',
  'Rubrica',
  'Fresa',
  'Sup.'
];

async function main() {
  const db = await connect();
  const operations = await db.collection('operations').find({}).toArray();
  console.log(`Operações encontradas: ${operations.length}`);
  let updatedCount = 0;

  for (const op of operations) {
    let updated = false;
    for (const field of PROCESS_FIELDS) {
      if (!(field in op)) {
        op[field] = '';
        updated = true;
        console.log(`Operação ${op._id}: campo '${field}' adicionado.`);
      }
    }
    if (updated) {
      await db.collection('operations').replaceOne({ _id: op._id }, op);
      updatedCount++;
    }
  }
  if (updatedCount > 0) {
    console.log(`Atualização concluída. Operações modificadas: ${updatedCount}`);
  } else {
    console.log('Nenhuma operação precisou ser atualizada. Todos os campos já estavam presentes.');
  }
  process.exit(0);
}

main().catch(err => {
  console.error('Erro ao atualizar operações:', err);
  process.exit(1);
}); 