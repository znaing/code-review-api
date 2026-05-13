const express = require('express');
const morgan = require('morgan');
const rateLimiter = require('./middleware/ratelimiter');
const errorHandler = require('./middleware/errorHandler');
const reviewRouter = require('./routes/review');
const { checkOllama, checkDatabase } = require('./services/healthService');
const modelsRouter = require('./routes/models');
const reviewsRouter = require('./routes/reviews');

const app = express();

//logging - 'dev' format METHOD / path STATUS -Xms -Xmx -Xms [ms] - time to first byte
app.use(morgan('dev'));

//Parse JSON bodies
app.use(express.json());

//Rate limit the whole API
app.use(rateLimiter);

app.use('/api/v1/reviews', reviewsRouter);



// Health check route — always useful to have
// Lets you confirm the server is running with a simple GET
app.get('/health', async (req, res) => {
    const [ollamaHealth, dbHealth] = await Promise.all([
        checkOllama(),
        checkDatabase(),
    ])

    const a110k = ollamaHealth.status == 'ok' && dbHealth.status === 'ok';

    res.status(a110k ? 200 : 503).json({
        status: a110k ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        services: {
            ollama: ollamaHealth,
            database: dbHealth,
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