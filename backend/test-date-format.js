const { executeQuery } = require('./config/oracle');

async function simpleTest() {
  console.log('🧪 Simple Oracle Test\n');
  
  try {
    // Test 1: Very simple query
    console.log('1. Testing basic connection:');
    try {
      const result = await executeQuery('SELECT 1 as test FROM DUAL');
      console.log('   ✅ Database connected:', result.rows[0].TEST === 1);
    } catch (error) {
      console.log('   ❌ Connection failed:', error.message);
      return;
    }
    
    // Test 2: Check member table
    console.log('\n2. Checking member table:');
    try {
      const count = await executeQuery('SELECT COUNT(*) as cnt FROM member');
      console.log('   Total members:', count.rows[0].CNT);
    } catch (error) {
      console.log('   ❌ Cannot access member table:', error.message);
      
      // Try to create table
      console.log('   💡 Trying to create member table...');
      try {
        await executeQuery(`
          CREATE TABLE member (
            m_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            f_name VARCHAR2(50) NOT NULL,
            l_name VARCHAR2(50),
            phone VARCHAR2(15) NOT NULL,
            status VARCHAR2(20) DEFAULT 'ACTIVE',
            created_by NUMBER DEFAULT 1,
            join_date DATE DEFAULT SYSDATE
          )
        `);
        console.log('   ✅ Member table created');
      } catch (createError) {
        console.log('   ❌ Cannot create table:', createError.message);
      }
    }
    
    // Test 3: Insert test data
    console.log('\n3. Testing data insertion:');
    try {
      await executeQuery(
        "INSERT INTO member (f_name, phone) VALUES ('Test User', '1234567890')"
      );
      console.log('   ✅ Test data inserted');
      
      // Verify
      const verify = await executeQuery("SELECT m_id, f_name FROM member WHERE f_name = 'Test User'");
      console.log('   Inserted ID:', verify.rows[0]?.M_ID);
      
      // Clean up
      await executeQuery("DELETE FROM member WHERE f_name = 'Test User'");
      console.log('   ✅ Test data cleaned');
      
    } catch (insertError) {
      console.log('   ❌ Insert failed:', insertError.message);
    }
    
    // Test 4: List all tables
    console.log('\n4. Listing database tables:');
    try {
      const tables = await executeQuery(
        "SELECT table_name FROM user_tables WHERE table_name LIKE '%MEMBER%' OR table_name LIKE '%STAFF%' OR table_name LIKE '%MEMBERSHIP%'"
      );
      console.log('   Found tables:', tables.rows.map(t => t.TABLE_NAME).join(', ') || 'None');
    } catch (tableError) {
      console.log('   ❌ Cannot list tables:', tableError.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

simpleTest();