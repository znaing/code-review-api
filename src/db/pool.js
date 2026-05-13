const { Pool } = require('pg');

//Pool maintains multiple open connections so queries dont 
//Wait for each other. much faster than opening a new 
//Connection per query 
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
});

module.exports = pool;

