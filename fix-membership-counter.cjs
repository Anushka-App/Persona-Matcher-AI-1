const dotenv = require('dotenv');
dotenv.config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://match_maker_user:ca22KPpezwg7b6MpN84qmI4GExGoCBCs@dpg-d2940m7diees73fit0g0-a.singapore-postgres.render.com/match_maker',
  ssl: { rejectUnauthorized: false }
});

async function fixMembershipCounter() {
  console.log('🔧 Fixing Membership Counter...\n');
  
  try {
    const client = await pool.connect();
    
    // Check current counter
    const currentResult = await client.query('SELECT current_number FROM membership_counter WHERE id = 1');
    const currentNumber = currentResult.rows[0]?.current_number || 30;
    console.log(`📊 Current membership counter: ${currentNumber}`);
    
    // Update to 10030
    await client.query(`
      UPDATE membership_counter 
      SET current_number = 10030, updated_at = CURRENT_TIMESTAMP 
      WHERE id = 1
    `);
    
    // Verify the update
    const newResult = await client.query('SELECT current_number FROM membership_counter WHERE id = 1');
    const newNumber = newResult.rows[0]?.current_number;
    console.log(`✅ Membership counter updated to: ${newNumber}`);
    console.log(`✅ Next membership number will be: ACS${newNumber + 1}`);
    
    client.release();
    
    console.log('\n🎉 Membership counter fixed successfully!');
    console.log('📋 Next registrations will get:');
    console.log('   - First user: ACS10031');
    console.log('   - Second user: ACS10032');
    console.log('   - Third user: ACS10033');
    console.log('   - And so on...');
    
  } catch (error) {
    console.error('❌ Error fixing membership counter:', error.message);
  } finally {
    await pool.end();
  }
}

fixMembershipCounter().catch(console.error);
