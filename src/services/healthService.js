//src/services/healthService.js
const ollama = require('ollama').default;

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

module.exports = { checkOllama };