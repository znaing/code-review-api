const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth')
const validateReview = require('../middleware/validate')
const { reviewCode } = require('../services/ollamaService')

//Apply rate limiting to this route
router.post('/', authMiddleware, validateReview, async (req, res, next) => {
    try {
        const { diff, language, filename } = req.body;

        //Call Ollama - this takes a few seconds, thats normal 
        const review = await reviewCode({ diff, language, filename })

        res.json({
            reviewId: `review-${Date.now()}`,
            filename,
            language,
            issues: review.issues,
            summary: review.summary,
            approved: review.approved,
            model: review.model,
            promptVersion: review.promptVersion,
            durationMs: review.durationMs,
            createdAt: new Date().toISOString(),
        });

    } catch (err) {
        //if JSON parsing fails or ollama is down, pass to errror handler
        if (err instanceof SyntaxError) {
            err.message = 'Model returned invalid JSON - try again';
            err.statusCode = 502;
        }
        next(err);
    }
});

module.exports = router;
