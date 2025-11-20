import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration from environment or defaults
const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root'
};

console.log('===================================');
console.log('Pedidos YEMM - Database Setup');
console.log('===================================\n');

console.log('Database Configuration:');
console.log(`  Host: ${config.host}`);
console.log(`  Port: ${config.port}`);
console.log(`  Database: ${config.database}`);
console.log(`  User: ${config.user}\n`);

// Read schema file
const schemaPath = path.join(__dirname, 'database', 'schema.sql');
let schema;

try {
  schema = fs.readFileSync(schemaPath, 'utf8');
  console.log('✓ Schema file loaded\n');
} catch (error) {
  console.error('❌ Error: Could not read schema file');
  console.error(error.message);
  process.exit(1);
}

// Connect to database
const pool = new pg.Pool(config);

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Testing database connection...');
    await client.query('SELECT 1');
    console.log('✓ Database connection successful\n');
    
    console.log('Creating database schema...');
    await client.query(schema);
    console.log('✓ Database schema created successfully!\n');
    
    // Show created tables
    console.log('Tables created:');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    console.log('\n===================================');
    console.log('Setup completed successfully! ✓');
    console.log('===================================\n');
    
    console.log('Next steps:');
    console.log('1. Start the server: npm start');
    console.log('2. Open index.html in a browser');
    console.log('3. Orders will now be saved to the database!\n');
    
  } catch (error) {
    console.error('\n❌ Error setting up database:');
    console.error(error.message);
    
    if (error.code === '28P01') {
      console.error('\nAuthentication failed. Please check your database password.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\nCould not connect to database. Is PostgreSQL running?');
    }
    
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
