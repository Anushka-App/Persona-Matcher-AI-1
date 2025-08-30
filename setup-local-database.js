const { Pool } = require('pg');

// Local PostgreSQL connection for development
const localConnectionString = 'postgresql://postgres:password@localhost:5432/anuschka_dev';

async function setupLocalDatabase() {
  console.log('🔧 Setting up local database...');
  
  const pool = new Pool({
    connectionString: localConnectionString,
    ssl: false
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to local database');
    
    // Create database if it doesn't exist
    await client.query('CREATE DATABASE IF NOT EXISTS anuschka_dev');
    console.log('✅ Database created/verified');
    
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS anuschka_users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50) NOT NULL,
        membership_number VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS membership_counter (
        id INTEGER PRIMARY KEY DEFAULT 1,
        current_number INTEGER NOT NULL DEFAULT 30,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Initialize counter
    await client.query(`
      INSERT INTO membership_counter (id, current_number) 
      VALUES (1, 30) 
      ON CONFLICT (id) DO NOTHING
    `);
    
    console.log('✅ Tables created successfully');
    client.release();
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n📋 To fix this:');
    console.log('1. Install PostgreSQL locally');
    console.log('2. Create a database named "anuschka_dev"');
    console.log('3. Update the connection string in this script');
  } finally {
    await pool.end();
  }
}

setupLocalDatabase();
