require('dotenv').config({ path:'C:\\Users\\gary\\Documents\\GitHub\\proyectohtmlfinal\\pedidos-yemm-project\\.env'});
const { Pool } = require('pg');
console.log('📦 Variables cargadas:');
console.log({
  PGHOST: process.env.PGHOST,
  PGPORT: process.env.PGPORT,
  PGDATABASE: process.env.PGDATABASE,
  PGUSER: process.env.PGUSER,
  PGPASSWORD: process.env.PGPASSWORD
});

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5433),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  max: 10,
  idleTimeoutMillis: 30000
});
pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL'))
  .catch(err => console.error('❌ Error de conexión a PostgreSQL:', err));

module.exports = pool;