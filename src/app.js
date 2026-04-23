const express = require('express');
const rateLimiter = require('./middleware/ratelimiter');
const reviewRouter = require('./routes/review');

const app = express();

// Middleware: parse incoming JSON request bodies
// Without this, req.body would be undefined so we parse the JSON
app.use(express.json());
app.use(rateLimiter);


// Health check route — always useful to have
// Lets you confirm the server is running with a simple GET
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/review', reviewRouter);
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist.',
    });
});

module.exports = app;