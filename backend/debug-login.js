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

async function debugLogin() {
  let connection;
  
  try {
    console.log('🔍 Debugging login...\n');
    
    connection = await oracledb.getConnection(dbConfig);
    
    // 1. Check if admin exists
    console.log('1. Checking admin user in database...');
    const adminResult = await connection.execute(
      `SELECT 
        staff_id,
        first_name,
        last_name,
        username,
        password_hash,
        role,
        status,
        LENGTH(password_hash) as hash_length
       FROM staff 
       WHERE username = 'admin'`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    if (adminResult.rows.length === 0) {
      console.log('❌ Admin user not found in database!');
      return;
    }
    
    const admin = adminResult.rows[0];
    console.log('✅ Admin found:', {
      id: admin.STAFF_ID,
      name: `${admin.FIRST_NAME} ${admin.LAST_NAME}`,
      username: admin.USERNAME,
      role: admin.ROLE,
      status: admin.STATUS,
      password_hash: admin.PASSWORD_HASH,
      hash_length: admin.HASH_LENGTH
    });
    
    // 2. Test bcrypt verification
    console.log('\n2. Testing password verification...');
    const testPassword = 'admin123';
    console.log(`Test password: "${testPassword}"`);
    console.log(`Stored hash: "${admin.PASSWORD_HASH}"`);
    
    try {
      // First, let's create a new hash to see format
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log(`New hash of "${testPassword}": ${newHash}`);
      console.log(`New hash length: ${newHash.length}`);
      
      // Try to verify
      const isValid = await bcrypt.compare(testPassword, admin.PASSWORD_HASH);
      console.log(`\nbcrypt.compare("${testPassword}", stored_hash) = ${isValid}`);
      
      if (!isValid) {
        // Try with trimmed hash
        const trimmedHash = admin.PASSWORD_HASH.trim();
        console.log(`\nTrying with trimmed hash: "${trimmedHash}"`);
        const isValidTrimmed = await bcrypt.compare(testPassword, trimmedHash);
        console.log(`bcrypt.compare with trimmed hash = ${isValidTrimmed}`);
        
        // Check hash format
        console.log(`\nHash format check:`);
        console.log(`- Starts with $2a$: ${admin.PASSWORD_HASH.startsWith('$2a$')}`);
        console.log(`- Starts with $2b$: ${admin.PASSWORD_HASH.startsWith('$2b$')}`);
        console.log(`- Starts with $2y$: ${admin.PASSWORD_HASH.startsWith('$2y$')}`);
        console.log(`- Hash length: ${admin.PASSWORD_HASH.length}`);
      }
      
    } catch (bcryptError) {
      console.log('❌ Bcrypt error:', bcryptError.message);
    }
    
    // 3. Test API endpoint directly
    console.log('\n3. Testing API endpoint...');
    console.log('Run this command to test:');
    console.log('curl -X POST http://localhost:5000/api/auth/login \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"username":"admin","password":"admin123"}\'');
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

debugLogin();