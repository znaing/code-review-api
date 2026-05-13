//src/services/healthService.js
const ollama = require('ollama').default;
const pool = require('../db/pool');

const checkOllama = async () => {
    try {
        //list() calls Ollama's API - if Ollama is down this throws
        const models = await ollama.list();
        return {
            status: 'ok',
            models: models.models.map(m => m.name),
        };

    } catch (err) {
        return {
            status: 'unreachable',
            error: err.message,
        };
    }
};

const checkDatabase = async () => {
    try {
        await pool.query('SELECT 1');
        return { status: 'ok' };
    } catch (err) {
        return { status: 'unreachable', error: err.message };
    }
};

module.exports = { checkOllama, checkDatabase };