const oracledb = require('oracledb');
require('dotenv').config();

// Initialize Oracle client
oracledb.initOracleClient({ 
  libDir: process.env.ORACLE_CLIENT_PATH || 'C:\\oracle\\instantclient_21_12' 
  // Update this path to your Oracle Instant Client location
});

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'SYSTEM',
  password: process.env.DB_PASSWORD || 'your_password',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/XE',
  poolMin: 1,
  poolMax: 10,
  poolIncrement: 1,
  poolTimeout: 60
};

// Create connection pool
let pool;

async function initialize() {
  try {
    pool = await oracledb.createPool(dbConfig);
    console.log('✅ Oracle connection pool created');
  } catch (err) {
    console.error('❌ Error creating connection pool:', err.message);
    process.exit(1);
  }
}

async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (err) {
    console.error('❌ Error getting connection:', err.message);
    throw err;
  }
}

async function closePool() {
  try {
    await pool.close();
    console.log('✅ Connection pool closed');
  } catch (err) {
    console.error('❌ Error closing pool:', err.message);
  }
}

// Execute query helper function
async function executeQuery(sql, binds = [], options = {}) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...options
    });
    return result;
  } catch (err) {
    console.error('❌ Query execution error:', err.message);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('❌ Error closing connection:', err.message);
      }
    }
  }
}

// Execute many rows
async function executeMany(sql, binds, options = {}) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.executeMany(sql, binds, {
      autoCommit: true,
      ...options
    });
    return result;
  } catch (err) {
    console.error('❌ Execute many error:', err.message);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('❌ Error closing connection:', err.message);
      }
    }
  }
}

module.exports = {
  initialize,
  getConnection,
  closePool,
  executeQuery,
  executeMany,
  oracledb
};