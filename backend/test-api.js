const request = require('supertest');
const app = require('./server');

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthRes = await request(app).get('/api/health');
    console.log(`   Status: ${healthRes.status}`);
    console.log(`   Response: ${JSON.stringify(healthRes.body)}\n`);

    // Test root endpoint
    console.log('2. Testing root endpoint...');
    const rootRes = await request(app).get('/');
    console.log(`   Status: ${rootRes.status}`);
    console.log(`   Message: ${rootRes.body.message}\n`);

    // Test members endpoint
    console.log('3. Testing members test endpoint...');
    const membersRes = await request(app).get('/api/members/test');
    console.log(`   Status: ${membersRes.status}`);
    console.log(`   Message: ${membersRes.body.message}\n`);

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;