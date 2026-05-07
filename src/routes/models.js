//src/routes/models.js
const express = require('express');
const router = express.Router();
const ollama = require('ollama').default;
const authMiddleware = require('../middleware/auth');

//GET /api/v1/models - list all locally available Ollama models 
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const result = await ollama.list()
        const models = result.models.map(m => ({
            name: m.name,
            size: formatBytes(m.size),
            modifiedAt: m.modified_at
        }));

        res.json({
            models,
            active: process.env.OLLAMA_MODEL || 'gemma4:e4b',
            count: models.length,
        });

    } catch (err) {
        err.messsage = 'Could not reach OLLAMA to list models';
        err.statusCode = 503;
        next(err);
    }
});

//Convert bytes ti human readable string 
const formatBytes = (bytes) => {
    if (!bytes) return 'unknown';
    const gb = bytes / (1024 ** 3);
    if (gb >= 1) return `${gb.toFixed(1)}GB`;
    const mb = bytes / (1024 ** 2);
    return '${mb.toFixed(0)}MB';
};

module.exports = router;
