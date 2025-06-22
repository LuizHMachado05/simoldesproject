require('dotenv').config();
const express = require('express');
const cors = require('cors');
const operatorsRouter = require('./routes/operators');
const machinesRouter = require('./routes/machines');
const operationsRouter = require('./routes/operations');
const projectsRouter = require('./routes/projects');
const logsRouter = require('./routes/logs');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/operators', operatorsRouter);
app.use('/api/machines', machinesRouter);
app.use('/api/operations', operationsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/logs', logsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/operators', async (req, res) => {
  const db = await connect();
  const result = await db.collection('operators').insertOne(req.body);
  res.json(result.ops[0]);
});

app.listen(PORT, () => {
  console.log(`API backend rodando em http://localhost:${PORT}`);
}); 