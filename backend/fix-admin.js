// backend/fix-admin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const oracledb = require('oracledb');

oracledb.initOracleClient({ 
  libDir: process.env.ORACLE_CLIENT_PATH || 'C:\\oracle\\instantclient_21_12'
});

const dbConfig = {
  user: process.env.DB_USER || 'SYSTEM',
  password: process.env.DB_PASSWORD || 'your_password',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/XE'
};

async function fixAdmin() {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);
    
    console.log('🛠️ Fixing admin password...\n');
    
    // 1. Show current hash
    const currentResult = await connection.execute(
      `SELECT password_hash FROM staff WHERE username = 'admin'`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    const currentHash = currentResult.rows[0]?.PASSWORD_HASH;
    console.log('Current hash in DB:', currentHash);
    console.log('Length:', currentHash?.length);
    
    // 2. Create CORRECT hash for "admin123"
    const correctPassword = 'admin123';
    console.log('\nCreating correct hash for password:', correctPassword);
    
    const correctHash = await bcrypt.hash(correctPassword, 10);
    console.log('✅ Correct hash:', correctHash);
    console.log('Correct hash length:', correctHash.length);
    
    // 3. Verify the new hash works
    console.log('\nVerifying new hash...');
    const verifyNewHash = await bcrypt.compare(correctPassword, correctHash);
    console.log('New hash verification:', verifyNewHash ? '✅ PASS' : '❌ FAIL');
    
    // 4. Update the database
    console.log('\nUpdating database...');
    await connection.execute(
      `UPDATE staff SET password_hash = :hash WHERE username = 'admin'`,
      { hash: correctHash }
    );
    
    await connection.commit();
    console.log('✅ Database updated!');
    
    // 5. Verify update
    const verifyResult = await connection.execute(
      `SELECT 
        username,
        SUBSTR(password_hash, 1, 20) || '...' as hash_preview,
        LENGTH(password_hash) as length
       FROM staff WHERE username = 'admin'`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    console.log('\n📋 Updated admin:');
    console.log(verifyResult.rows[0]);
    
    console.log('\n🎉 Login should now work with:');
    console.log('Username: admin');
    console.log('Password: admin123');
    
    // 6. Quick test
    console.log('\n🧪 Quick test:');
    const testResult = await bcrypt.compare('admin123', correctHash);
    console.log('Test "admin123" with new hash:', testResult ? '✅ Works!' : '❌ Fails');
    
    // Test wrong password
    const wrongTest = await bcrypt.compare('wrongpass', correctHash);
    console.log('Test "wrongpass" with new hash:', wrongTest ? '✅ (should fail)' : '✅ Correctly fails');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing:', err);
      }
    }
  }
}

fixAdmin();