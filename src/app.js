const express = require('express');
const authMiddleware = require('./middleware/auth')
const validateReview = require('./middleware/validate')

const app = express();

// Middleware: parse incoming JSON request bodies
// Without this, req.body would be undefined so we parse the JSON
app.use(express.json());


// Health check route — always useful to have
// Lets you confirm the server is running with a simple GET
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


// Placeholder review route — returns mock data for now
// req = the incoming request, res = the response you send back


app.post('/api/v1/review', authMiddleware, validateReview, (req, res) => {
    const { diff, language, filename } = req.body;

    // For now, just echo back what we received
    // Week 2 is where Ollama replaces this mock
    res.json({
        reviewId: 'mock001',
        filename,
        language,
        recievedDiff: diff,
        issues: [],
        summary: 'Mock response -Ollama integration coming in week 2'
    })
})
module.exports = app;