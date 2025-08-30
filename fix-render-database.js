const { Pool } = require('pg');

// Test different connection configurations
const connectionConfigs = [
  {
    name: 'Render Database (Current)',
    connectionString: 'postgresql://match_maker_user:ca22KPpezwg7b6MpN84qmI4GExGoCBCs@dpg-d2940m7diees73fit0g0-a.singapore-postgres.render.com/match_maker',
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Render Database (Alternative SSL)',
    connectionString: 'postgresql://match_maker_user:ca22KPpezwg7b6MpN84qmI4GExGoCBCs@dpg-d2940m7diees73fit0g0-a.singapore-postgres.render.com/match_maker',
    ssl: true
  },
  {
    name: 'Render Database (No SSL)',
    connectionString: 'postgresql://match_maker_user:ca22KPpezwg7b6MpN84qmI4GExGoCBCs@dpg-d2940m7diees73fit0g0-a.singapore-postgres.render.com/match_maker',
    ssl: false
  }
];

async function testConnection(config) {
  console.log(`\n🔍 Testing: ${config.name}`);
  
  const pool = new Pool({
    connectionString: config.connectionString,
    ssl: config.ssl
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query successful:', result.rows[0].current_time);
    
    // Test if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('anuschka_users', 'membership_counter')
    `);
    
    console.log('📊 Found tables:', tablesResult.rows.map(row => row.table_name));
    
    client.release();
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

async function testAllConnections() {
  console.log('🔧 Testing Render Database Connections...');
  
  for (const config of connectionConfigs) {
    const success = await testConnection(config);
    if (success) {
      console.log(`\n🎉 Working configuration found: ${config.name}`);
      console.log('Use this configuration in your DatabaseService.ts:');
      console.log(JSON.stringify(config, null, 2));
      return config;
    }
  }
  
  console.log('\n❌ All connection attempts failed');
  console.log('\n🔧 Next steps:');
  console.log('1. Check if the Render PostgreSQL service is running');
  console.log('2. Verify the database credentials in Render dashboard');
  console.log('3. Check if the database URL is correct');
  console.log('4. Consider using a local database for development');
}

testAllConnections();
