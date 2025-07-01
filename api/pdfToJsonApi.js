const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/api/pdf-to-json', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);

    // Log do texto extraído para análise
    console.log('--- TEXTO EXTRAÍDO DO PDF ---');
    console.log(data.text);
    console.log('--- FIM DO TEXTO EXTRAÍDO ---');

    // Parsing do texto para JSON estruturado
    const json = parsePdfTextToJson(data.text);

    fs.unlinkSync(req.file.path);
    res.json(json);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function parsePdfTextToJson(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Extrair campos do projeto (busca do final para o início)
  const projeto = {
    nome: '',
    material: '',
    programador: '',
    tempoProjeto: '',
    dataImpressao: '',
    pastaProgramas: '',
    pastaProjetoPowermill: ''
  };

  for (let i = lines.length - 1; i >= 0; i--) {
    if (!projeto.nome && lines[i].startsWith('Projecto')) {
      projeto.nome = lines[i].replace(/^Projecto\s*/i, '').replace(':', '').trim();
    }
    if (!projeto.material && lines[i].startsWith('Material:')) {
      projeto.material = lines[i].replace('Material:', '').trim();
    }
    if (!projeto.dataImpressao && lines[i].includes('Data:')) {
      projeto.dataImpressao = lines[i].split('Data:')[1].trim();
    }
    if (!projeto.pastaProgramas && lines[i].startsWith('Pasta dos Programas:')) {
      projeto.pastaProgramas = lines[i].replace('Pasta dos Programas:', '').trim();
    }
    if (!projeto.pastaProjetoPowermill && lines[i].startsWith('Pasta do Projeto Powermill:')) {
      projeto.pastaProjetoPowermill = lines[i].replace('Pasta do Projeto Powermill:', '').trim();
    }
    if (!projeto.programador && lines[i].startsWith('Programador:')) {
      const parts = lines[i].replace('Programador:', '').split('Tempo Projeto:');
      projeto.programador = parts[0].trim();
      projeto.tempoProjeto = (parts[1] || '').trim();
    }
  }

  // Extrair operações
  const operacoes = [];
  let i = 0;
  while (i < lines.length) {
    if (/^\d{2}$/.test(lines[i])) {
      const numero = lines[i];
      const tipo = lines[i+1] || '';
      const observacao = lines[i+2] || '';
      // Parâmetros técnicos: até encontrar 'Fresa:' ou 'Sup.:' ou próximo número de operação
      let parametros = [];
      let j = i+3;
      while (
        j < lines.length &&
        !/^\d{2}$/.test(lines[j]) &&
        !lines[j].startsWith('Fresa:') &&
        !lines[j].startsWith('Sup.:')
      ) {
        parametros.push(lines[j]);
        j++;
      }
      let ferramenta = '';
      let suporte = '';
      if (lines[j] && lines[j].startsWith('Fresa:')) {
        ferramenta = lines[j+1] || '';
        j += 2;
      }
      if (lines[j] && lines[j].startsWith('Sup.:')) {
        suporte = lines[j+1] || '';
        j += 2;
      }
      operacoes.push({
        numero,
        tipo,
        observacao,
        parametros: parametros.join(' '),
        ferramenta: ferramenta.trim(),
        suporte: suporte.trim()
      });
      i = j;
    } else {
      i++;
    }
  }

  return { projeto, operacoes };
}

app.listen(3010, () => {
  console.log('PDF to JSON API running on port 3010');
}); 