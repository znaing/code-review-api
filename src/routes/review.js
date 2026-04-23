const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth')
const validateReview = require('../middleware/validate')

//Apply rate limiting to this route
router.post('/', authMiddleware, validateReview, (req, res) => {
    const { diff, language, filename } = req.body;

    res.json({
        reviewId: 'mock-001',
        filename,
        language,
        receivedDiff: diff,
        issues: [],
        summary: 'Mock response - Ollama integration coming in week 2',
    });

});

module.exports = router;
