const express = require('express');
const router = express.Router();
const { connect } = require('../db/mongodb');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
const axios = require('axios');
const FormData = require('form-data');
const parse = require('csv-parse/sync').parse;

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const db = await connect();
    const projects = await db.collection('projects').find({}).sort({ createdAt: -1 }).toArray();
    res.json(projects);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro ao buscar projetos', details: error.message });
  }
});

// GET /api/projects/with-operations
router.get('/with-operations', async (req, res) => {
  try {
    const db = await connect();
    const { machine } = req.query;
    
    // Buscar todos os projetos ou filtrar por máquina
    const projectFilter = machine ? { machine: machine } : {};
    const projects = await db.collection('projects').find(projectFilter).sort({ createdAt: -1 }).toArray();
    
    // Para cada projeto, buscar suas operações
    const projectsWithOperations = await Promise.all(
      projects.map(async (project) => {
        try {
          const operations = await db.collection('operations')
            .find({ projectId: project._id })
            .sort({ sequence: 1 })
            .toArray();
          return {
            ...project,
            operations: operations
          };
        } catch (error) {
          console.error(`Erro ao buscar operações do projeto ${project._id}:`, error);
          return {
            ...project,
            operations: []
          };
        }
      })
    );
    
    res.json(projectsWithOperations);
  } catch (error) {
    console.error('Erro ao buscar projetos com operações:', error);
    res.status(500).json({ error: 'Erro ao buscar projetos com operações', details: error.message });
  }
});

// GET /api/projects/with-operations/:id
router.get('/with-operations/:id', async (req, res) => {
  try {
    const db = await connect();
    const { id } = req.params;
    const project = await db.collection('projects').findOne({ projectId: id });
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    const operations = await db.collection('operations').find({ projectId: project._id }).toArray();
    res.json({ ...project, operations });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar projeto com operações', details: error.message });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    console.log('Dados recebidos do projeto:', req.body);
    const db = await connect();
    console.log('Conexão com banco estabelecida');
    
    // Validar campos obrigatórios
    if (!req.body.projectId || !req.body.name || !req.body.machine) {
      return res.status(400).json({ error: 'Campos obrigatórios: projectId, name, machine' });
    }
    
    // Verificar se já existe um projeto com o mesmo projectId
    const existingProject = await db.collection('projects').findOne({ projectId: req.body.projectId });
    if (existingProject) {
      return res.status(409).json({ error: 'Já existe um projeto com este ID' });
    }
    
    // Adicionar timestamps automáticos e converter date para Date
    const projectData = {
      ...req.body,
      date: new Date(req.body.date), // Converter string para Date
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('projects').insertOne(projectData);
    console.log('Projeto inserido com sucesso:', result);
    
    // Retornar o projeto criado
    const createdProject = await db.collection('projects').findOne({ _id: result.insertedId });
    res.status(201).json(createdProject);
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ error: 'Erro ao criar projeto', details: error.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  try {
    const db = await connect();
    const { id } = req.params;
    
    // Primeiro tentar atualizar por _id (ObjectId)
    let result = await db.collection('projects').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    
    // Se não encontrou por _id, tentar por projectId
    if (result.matchedCount === 0) {
      result = await db.collection('projects').updateOne(
        { projectId: id },
        { $set: { ...req.body, updatedAt: new Date() } }
    );
    }
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar projeto', details: error.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await connect();
    const { id } = req.params;
    
    // Primeiro tentar deletar por _id (ObjectId)
    let result = await db.collection('projects').deleteOne({ _id: new ObjectId(id) });
    
    // Se não encontrou por _id, tentar por projectId
    if (result.deletedCount === 0) {
      result = await db.collection('projects').deleteOne({ projectId: id });
    }
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover projeto', details: error.message });
  }
});

// Finalizar um projeto
router.post('/finish', async (req, res) => {
  try {
    const { projectId } = req.body;
    console.log('[DEBUG] Finalizando projeto:', projectId);
    
    if (!projectId) {
      return res.status(400).json({ error: 'projectId é obrigatório' });
    }
    
    const db = await connect();
    
    // Buscar o projeto
    let projectFilter;
    if (ObjectId.isValid(projectId)) {
      projectFilter = { _id: new ObjectId(projectId) };
    } else {
      projectFilter = { projectId: projectId };
    }
    
    const project = await db.collection('projects').findOne(projectFilter);
    if (!project) {
      console.log('[DEBUG] Projeto não encontrado com filtro:', projectFilter);
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    console.log('[DEBUG] Projeto encontrado:', project._id, 'ProjectId:', project.projectId);
    
    // Verificar operações (apenas para log, não para bloquear)
    const operations = await db.collection('operations').find({ projectId: project._id }).toArray();
    const incompleteOperations = operations.filter(op => !op.completed);
    
    if (incompleteOperations.length > 0) {
      console.log('[DEBUG] Operações incompletas encontradas:', incompleteOperations.length);
      console.log('[DEBUG] Permitindo finalização mesmo com operações pendentes');
    }
    
    // Atualizar o projeto para finalizado
    const now = new Date();
    const updateData = {
      status: 'completed',
      completedDate: now,
      updatedAt: now
    };
    
    console.log('[DEBUG] Dados de atualização do projeto:', updateData);
    
    const result = await db.collection('projects').updateOne(
      { _id: project._id },
      { $set: updateData }
    );
    
    console.log('[DEBUG] Resultado do update do projeto:', result);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado para atualização' });
    }
    
    // Criar log da finalização do projeto
    try {
      await db.collection('projectLogs').insertOne({
        projectId: project._id,
        action: 'finish',
        timestamp: now,
        details: {
          previousStatus: project.status,
          newStatus: 'completed',
          totalOperations: operations.length,
          completedOperations: operations.filter(op => op.completed).length
        }
      });
      console.log('[DEBUG] Log de finalização do projeto criado com sucesso');
    } catch (logError) {
      console.error('[DEBUG] Erro ao criar log de finalização:', logError);
      // Não falhar se o log não puder ser criado
    }
    
    res.json({ 
      success: true, 
      message: 'Projeto finalizado com sucesso',
      projectId: project._id,
      completedDate: now
    });
  } catch (error) {
    console.error('Erro ao finalizar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

// POST /api/projects/import-pdf-project
router.post('/import-pdf-project', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  let data;
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    data = await pdfParse(dataBuffer);
    fs.unlinkSync(req.file.path);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao ler PDF', details: err.message });
  }

  // Função de parsing adaptada para PDFs tabulares
  function parsePdfTextToJson(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const projeto = {
      nome: '', material: '', programador: '', tempoProjeto: '', dataImpressao: '', pastaProgramas: '', pastaProjetoPowermill: ''
    };
    // Extrair metadados do projeto
    for (let i = lines.length - 1; i >= 0; i--) {
      if (!projeto.nome && lines[i].toLowerCase().includes('projecto')) projeto.nome = lines[i].replace(/^Projecto\s*/i, '').replace(':', '').trim().replace(/sumario/i, '').trim();
      if (!projeto.material && lines[i].toLowerCase().startsWith('material:')) projeto.material = lines[i].replace(/material:/i, '').trim();
      if (!projeto.dataImpressao && lines[i].toLowerCase().includes('data:')) projeto.dataImpressao = lines[i].split(/data:/i)[1].trim();
      if (!projeto.pastaProgramas && lines[i].toLowerCase().startsWith('pasta dos programas:')) projeto.pastaProgramas = lines[i].replace(/pasta dos programas:/i, '').trim();
      if (!projeto.pastaProjetoPowermill && lines[i].toLowerCase().startsWith('pasta do projeto powermill:')) projeto.pastaProjetoPowermill = lines[i].replace(/pasta do projeto powermill:/i, '').trim();
      if (!projeto.programador && lines[i].toLowerCase().startsWith('programador:')) {
        const parts = lines[i].replace(/programador:/i, '').split(/tempo projeto:/i);
        projeto.programador = parts[0].trim();
        projeto.tempoProjeto = (parts[1] || '').trim();
      }
    }
    if (!projeto.nome) {
      let pasta = projeto.pastaProgramas || projeto.pastaProjetoPowermill;
      if (pasta) {
        const partes = pasta.split(/[\\\/]/);
        projeto.nome = partes[partes.length - 1].trim();
      }
    }
    let maquina = '';
    if (projeto.nome) {
      const match = projeto.nome.match(/^(F\d{4})[_-]/i);
      if (match) {
        maquina = match[1];
      }
    }
    // Parser robusto de operações tabulares
    const operacoes = [];
    // Lista dos números de operação válidos (01 a 07)
    const opNumeros = ['01','02','03','04','05','06','07'];
    let i = 0;
    while (i < lines.length) {
      // Só considera início de operação se for '01' a '07' (ajuste conforme o PDF)
      if (opNumeros.includes(lines[i])) {
        const numero = lines[i];
        let bloco = [lines[i]];
        let j = i+1;
        // Agrupa linhas até próxima operação real
        while (j < lines.length && !opNumeros.includes(lines[j])) {
          bloco.push(lines[j]);
          j++;
        }
        // Extrair campos do bloco
        let tipo = '', ref = '', comentario = '', ferramenta = '', suporte = '', camposTecnicos = '';
        // 1. Tipo e função
        tipo = bloco[1] || '';
        ref = bloco[2] || '';
        // 2. Comentário (pode ser multiline)
        let comentarioIdx = 3;
        comentario = '';
        while (comentarioIdx < bloco.length && !/\d/.test(bloco[comentarioIdx]) && !bloco[comentarioIdx].toLowerCase().startsWith('fresa:') && !bloco[comentarioIdx].toLowerCase().startsWith('sup.:')) {
          comentario += (bloco[comentarioIdx] + ' ');
          comentarioIdx++;
        }
        comentario = comentario.trim();
        // 3. Linha técnica: a que tem mais de 5 números separados por espaço
        let camposIdx = comentarioIdx;
        let maxNumeros = 0;
        for (let k = comentarioIdx; k < bloco.length; k++) {
          const n = (bloco[k].match(/-?\d{1,4}(?:[.,]\d+)?/g) || []).length;
          if (n > maxNumeros) {
            maxNumeros = n;
            camposTecnicos = bloco[k];
          }
        }
        // 4. Fresa e suporte (associar à operação)
        for (let k = comentarioIdx; k < bloco.length; k++) {
          if (bloco[k].toLowerCase().startsWith('fresa:')) {
            ferramenta = bloco[k].replace(/fresa:/i, '').trim();
          }
          if (bloco[k].toLowerCase().startsWith('sup.:')) {
            suporte = bloco[k].replace(/sup.:/i, '').trim();
          }
        }
        // 5. Extrair campos técnicos usando regex (ajustar conforme padrão)
        // Exemplo: "80 2 50 50 -145 -0,5 0 53 0,8 0,05 577 6058 3º"
        let [diameter, rc, rib, alt, zMin, lat2d, lat, vert, passoLat, passoVert, tol, rot, av, angulo] = ['', '', '', '', '', '', '', '', '', '', '', '', '', ''];
        if (camposTecnicos) {
          // Regex para capturar os campos separados por espaço, incluindo negativos e decimais
          const campos = camposTecnicos.match(/-?\d{1,4}(?:[.,]\d+)?|[A-Za-zº]+/g) || [];
          [diameter, rc, rib, alt, zMin, lat2d, lat, vert, passoLat, passoVert, tol, rot, av, angulo] = campos;
        }
        // Montar objeto operação
        operacoes.push({
          numero,
          tipo,
          ref,
          comentario,
          ferramenta,
          suporte,
          diameter,
          rc,
          rib,
          alt,
          zMin,
          lat2d,
          lat,
          vert,
          passoLat,
          passoVert,
          tol,
          rot,
          av,
          angulo
        });
        i = j;
      } else {
        i++;
      }
    }
    return { projeto, operacoes, maquina };
  }

  // Parsear texto extraído
  const parsed = parsePdfTextToJson(data.text);
  console.log('[IMPORT PDF] Resultado do parser:', JSON.stringify(parsed, null, 2));
  if (parsed.operacoes) {
    console.log(`[IMPORT PDF] Operações extraídas: ${parsed.operacoes.length}`);
    parsed.operacoes.forEach((op, idx) => {
      console.log(`[IMPORT PDF] Operação ${idx + 1}:`, op);
    });
  }
  // Validar campos obrigatórios do projeto
  if (!parsed.projeto.nome) return res.status(400).json({ error: 'Nome do projeto não encontrado no PDF' });
  if (!parsed.projeto.dataImpressao) return res.status(400).json({ error: 'Data do projeto não encontrada no PDF' });

  try {
    const db = await connect();
    // Verificar se já existe projeto
    const projectId = parsed.projeto.nome.replace(/\s+/g, '_');
    const existing = await db.collection('projects').findOne({ projectId });
    if (existing) return res.status(409).json({ error: 'Já existe um projeto com este nome extraído do PDF' });
    // Tentar pegar a máquina do PDF, senão do frontend (req.body.machine ou req.query.machine)
    let machine = parsed.maquina || '';
    if (!machine) {
      machine = req.body?.machine || req.query?.machine || '';
    }
    // Criar projeto
    const projectDoc = {
      projectId,
      name: parsed.projeto.nome,
      machine,
      date: new Date(parsed.projeto.dataImpressao),
      material: parsed.projeto.material,
      programador: parsed.projeto.programador,
      tempoProjeto: parsed.projeto.tempoProjeto,
      pastaProgramas: parsed.projeto.pastaProgramas,
      pastaProjetoPowermill: parsed.projeto.pastaProjetoPowermill,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('projects').insertOne(projectDoc);
    const projectDb = await db.collection('projects').findOne({ _id: result.insertedId });
    // Criar operações
    // Log detalhado das operações extraídas do parser
    console.log('[IMPORT PDF] Operações extraídas do parser:');
    parsed.operacoes.forEach((op, idx) => {
      console.log(`[OPERAÇÃO ${idx + 1}]`, JSON.stringify(op, null, 2));
    });
    const operations = parsed.operacoes.map((op, idx) => {
      // Garantir que type seja apenas 'Furação' ou 'Fresamento'
      let type = '';
      if (/fura/i.test(op.tipo)) type = 'Furação';
      else if (/fres/i.test(op.tipo)) type = 'Fresamento';
      else if (/rosca/i.test(op.tipo) || /macho/i.test(op.comentario || '')) type = 'Furação';
      else type = 'Furação'; // fallback

      // function: usar ref ou tipo original
      let func = op.ref || op.tipo || '';

      // Preencher campos técnicos
      const details = {
        depth: op.zMin || '',
        speed: op.rot || '',
        feed: op.av || '',
        coolant: '',
        notes: op.comentario || ''
      };

      // Log detalhado do objeto que será salvo no banco
      const opToSave = {
        projectId: projectDb._id,
        sequence: op.numero || String(idx + 1),
        type,
        function: func,
        centerPoint: op.lat2d || '',
        toolRef: op.ferramenta || '',
        ic: op.rc || '',
        alt: op.alt || '',
        time: { machine: '', total: '' },
        details,
        quality: { tolerance: op.tol || '', surfaceFinish: '', requirements: [] },
        imageUrl: '',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log(`[MAPPING OPERAÇÃO ${idx + 1}]`, JSON.stringify(opToSave, null, 2));
      return opToSave;
    });
    if (operations.length > 0) {
      try {
        const sanitizedOperations = operations.map(op => {
          const { id, _id, ...rest } = op;
          return rest;
        });
        await db.collection('operations').insertMany(sanitizedOperations);
      } catch (opErr) {
        console.error('[IMPORT PDF] Erro ao inserir operações:', opErr);
        return res.status(500).json({ error: 'Erro ao inserir operações', details: opErr && opErr.message ? opErr.message : opErr });
      }
    }
    res.status(201).json({ success: true, project: projectDb, operationsCount: operations.length });
  } catch (err) {
    console.error('[IMPORT PDF] Erro geral ao criar projeto/operacoes:', err);
    res.status(500).json({ error: 'Erro ao criar projeto/operacoes', details: err && err.message ? err.message : err });
  }
});

// Função auxiliar para extrair dados técnicos de uma string
function extractTechnicalDetails(paramStr) {
  const details = { depth: '', speed: '', feed: '', coolant: '', notes: paramStr || '' };
  if (!paramStr) return details;
  // Extrair profundidade (ex: 85mm)
  const depthMatch = paramStr.match(/(\d{1,4}(?:[.,]\d+)?\s?mm)/i);
  if (depthMatch) details.depth = depthMatch[1];
  // Extrair rotação (ex: 2800 RPM)
  const speedMatch = paramStr.match(/(\d{3,5}\s?RPM)/i);
  if (speedMatch) details.speed = speedMatch[1];
  // Extrair avanço (ex: 0.12mm/rev)
  const feedMatch = paramStr.match(/(\d{1,2}[.,]\d{1,3}\s?mm\/rev)/i);
  if (feedMatch) details.feed = feedMatch[1];
  // Extrair coolant (ex: Externa 45 bar)
  const coolantMatch = paramStr.match(/(Externa\s*\d{1,3}\s*bar|Interna\s*\d{1,3}\s*bar)/i);
  if (coolantMatch) details.coolant = coolantMatch[1];
  return details;
}

function adaptOperation(doc, projectId) {
  return {
    projectId: typeof projectId === 'string' ? new ObjectId(projectId) : projectId,
    sequence: doc['Nº'] || '',
    type: doc['Tipo de Operação'] && doc['Tipo de Operação'].includes('Fura') ? 'Furação' : 'Fresamento',
    function: doc['Observação'] || '',
    centerPoint: doc['Ø'] || '',
    toolRef: doc['Ferramenta'] || '',
    ic: doc['Passos'] || '',
    alt: doc['Z Min'] || '',
    time: {
      machine: '', // ou preencha se houver no CSV
      total: ''
    },
    details: {
      depth: doc['Z Min'] || '',
      speed: doc['Rotação'] || '',
      feed: doc['Avanço'] || '',
      coolant: doc['Suporte'] || '',
      notes: doc['Observação'] || ''
    },
    quality: {
      tolerance: doc['Tolerância'] || '',
      surfaceFinish: '',
      requirements: []
    },
    imageUrl: '',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    signedBy: '',
    timestamp: new Date(),
    inspectionNotes: '',
    timeRecord: { start: new Date(0), end: new Date(0) },
    measurementValue: ''
  };
}

// POST /api/projects/import-csv
router.post('/import-csv', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo CSV enviado' });
  const projectId = req.body.projectId || req.query.projectId;
  console.log('[IMPORT CSV] projectId recebido:', projectId);
  if (!projectId) return res.status(400).json({ error: 'projectId é obrigatório' });
  const db = await connect();
  let project;
  try {
    project = await db.collection('projects').findOne({ _id: new ObjectId(projectId) });
    console.log('[IMPORT CSV] Projeto encontrado:', project);
  } catch (e) {
    return res.status(400).json({ error: 'projectId inválido' });
  }
  if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });
  try {
    // Ler o CSV
    const csvData = fs.readFileSync(req.file.path, 'utf-8');
    // Parse CSV localmente
    fs.unlinkSync(req.file.path);
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ';',
      trim: true
    });
    console.log('[IMPORT CSV] JSON convertido localmente:', JSON.stringify(records, null, 2));
    if (!records || !Array.isArray(records) || records.length === 0) return res.status(500).json({ error: 'Erro ao converter CSV para JSON' });
    // Mapeamento campo a campo para cada linha do CSV
    const mappedRecords = records.map(row => adaptOperation(row, project._id));
    await db.collection('operations').insertMany(mappedRecords, { ordered: false });
    res.json({ success: true, count: records.length });
  } catch (err) {
    console.error('[IMPORT CSV] Erro:', err);
    if (err && err.writeErrors && err.writeErrors.length > 0) {
      err.writeErrors.forEach((e, i) => {
        const failedDoc = e.err && e.err.op ? e.err.op : null;
        if (failedDoc) {
          console.error(`[IMPORT CSV] Documento que falhou na validação (#${i + 1}):`, JSON.stringify(failedDoc, null, 2));
        }
        console.error(`[IMPORT CSV] WriteError #${i}:`, JSON.stringify(e, null, 2));
      });
    }
    res.status(500).json({ error: 'Erro ao importar CSV', details: err && err.message ? err.message : err });
  }
});

function safeString(val) {
  return typeof val === 'string' ? val : (val == null ? null : String(val));
}
function safeBool(val) {
  if (typeof val === 'boolean') return val;
  if (val === 'true' || val === '1') return true;
  if (val === 'false' || val === '0') return false;
  return null;
}
function safeDate(val) {
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}
function safeArray(val) {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === 'string' && val.trim()) return [val];
  return [];
}

function mapCsvToOperationLoose(row, projectId) {
  // Mapeamento direto: só preenche se o valor do CSV existir e for do tipo esperado
  const op = {};
  op.projectId = typeof projectId === 'string' ? new ObjectId(projectId) : projectId;
  if (typeof row['Nº'] === 'string') op.sequence = row['Nº'];
  if (typeof row['Tipo de Operação'] === 'string') op.type = row['Tipo de Operação'];
  if (typeof row['Observação'] === 'string') op.function = row['Observação'];
  if (typeof row['Ø'] === 'string') op.centerPoint = row['Ø'];
  if (typeof row['Ferramenta'] === 'string') op.toolRef = row['Ferramenta'];
  if (typeof row['Passos'] === 'string') op.ic = row['Passos'];
  if (typeof row['Z Min'] === 'string') op.alt = row['Z Min'];
  // Campos compostos
  op.time = { machine: '', total: '' };
  op.details = {
    depth: typeof row['Z Min'] === 'string' ? row['Z Min'] : '',
    speed: typeof row['Rotação'] === 'string' ? row['Rotação'] : '',
    feed: typeof row['Avanço'] === 'string' ? row['Avanço'] : '',
    coolant: typeof row['Suporte'] === 'string' ? row['Suporte'] : '',
    notes: typeof row['Observação'] === 'string' ? row['Observação'] : ''
  };
  op.quality = {
    tolerance: typeof row['Tolerância'] === 'string' ? row['Tolerância'] : '',
    surfaceFinish: '',
    requirements: []
  };
  op.imageUrl = '';
  op.completed = false;
  op.createdAt = new Date();
  op.updatedAt = new Date();
  op.signedBy = '';
  op.timestamp = null;
  op.inspectionNotes = '';
  op.timeRecord = { start: null, end: null };
  op.measurementValue = '';
  return op;
}

// Importação CSV simples: converte CSV para JSON e insere cada linha como documento na coleção 'operations'
router.post('/import-csv-simple', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo CSV enviado' });
  const projectId = req.body.projectId || req.query.projectId;
  const db = await connect();
  try {
    const csvData = fs.readFileSync(req.file.path, 'utf-8');
    fs.unlinkSync(req.file.path);
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ';',
      trim: true
    });
    if (!records || !Array.isArray(records) || records.length === 0) return res.status(500).json({ error: 'Erro ao converter CSV para JSON' });
    // Mapeamento campo a campo para cada linha do CSV
    const mappedRecords = records.map(row => adaptOperation(row, projectId));
    await db.collection('operations').insertMany(mappedRecords, { ordered: false });
    res.json({ success: true, count: records.length });
  } catch (err) {
    console.error('[IMPORT CSV SIMPLE] Erro:', err);
    res.status(500).json({ error: 'Erro ao importar CSV simples', details: err && err.message ? err.message : err });
  }
});

module.exports = router; 