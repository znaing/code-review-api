const express = require('express');
const morgan = require('morgan');
const rateLimiter = require('./middleware/ratelimiter');
const errorHandler = require('./middleware/errorHandler');
const reviewRouter = require('./routes/review');

const app = express();

//logging - 'dev' format METHOD / path STATUS -Xms -Xmx -Xms [ms] - time to first byte
app.use(morgan('dev'));

//Parse JSON bodies
app.use(express.json());

//Rate limit the whole API
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
//Global error handler = must be last, after all routes
app.use(errorHandler);

module.exports = app;