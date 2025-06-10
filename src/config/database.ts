import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

// Configuração do pool de conexões
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  max: 20, // número máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo máximo que uma conexão pode ficar inativa
  connectionTimeoutMillis: 2000, // tempo máximo para estabelecer uma conexão
});

// Teste de conexão inicial
pool.on('connect', () => {
  console.log('Base de Dados conectada com sucesso!');
});

pool.on('error', (err) => {
  console.error('Erro na conexão do Banco de Dados:', err);
});

export default pool; 