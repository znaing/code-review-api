const authMiddleware = (req, res, next) => {
    //Pull the API key from the request header
    const apiKey = req.headers['x-api-key'];

    //If no key was provided at all 
    if (!apiKey) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing X-Api-Key Header'
        });
    }

    //If the API key doesn't match what we jave .env
    if (apiKey !== process.env.API_KEY) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Invalid API Key',
        });
    }

    //Key is valid- pass the request to the next middleware or route handler
    next();
};

module.exports = authMiddleware;
