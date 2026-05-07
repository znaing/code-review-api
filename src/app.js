const express = require('express');
const morgan = require('morgan');
const rateLimiter = require('./middleware/ratelimiter');
const errorHandler = require('./middleware/errorHandler');
const reviewRouter = require('./routes/review');
const { checkOllama } = require('./services/healthService');
const modelsRouter = require('./routes/models');


const app = express();

//logging - 'dev' format METHOD / path STATUS -Xms -Xmx -Xms [ms] - time to first byte
app.use(morgan('dev'));

//Parse JSON bodies
app.use(express.json());

//Rate limit the whole API
app.use(rateLimiter);



// Health check route — always useful to have
// Lets you confirm the server is running with a simple GET
app.get('/health', async (req, res) => {
    const ollamaHealth = await checkOllama();
    const status = ollamaHealth.status === 'ok' ? 200 : 503;

    res.status(status).json({
        status: ollamaHealth.status === 'ok' ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        services: {
            ollama: ollamaHealth
        },
    });
});


app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/models', modelsRouter);

app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'Cannot ${req.method} ${req.path}',
    });
});
//Global error handler = must be last, after all routes
app.use(errorHandler);

module.exports = app;