//src/db/migrate.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

const migrate = async () => {
    try {
        const sql = fs.readFileSync(
            path.join(__dirname, 'schema.sql'),
            'utf8'
        );
        await pool.query(sql);
        console.log('Database migration completed successfully');
    } catch (err) {
        console.log('Migration Failed: ', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

migrate();
