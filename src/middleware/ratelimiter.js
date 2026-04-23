const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minutes
    max: 50, // Max 50 requests per 15 minutes window
    standardHeaders: true, //return rate limit info in response headers
    legacyHeaders: false, // disable older X-RateLimit headers

    //Custom message when someone hits the limit 
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again in 15 minutes.',
        });
    },
});

module.exports = rateLimiter;