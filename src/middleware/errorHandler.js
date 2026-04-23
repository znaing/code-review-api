const errorHandler = (err, req, res, next) => {
    //log the full error to the terminal so you can debug it
    console.error('Unhandled error:', err)

    // if we already started sending a response, let Express handle it
    if (res.headersSent) {
        return next(err);
    }

    //Determine status code - use whatever was set, or default to 500 
    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
        error: err.name || 'Internal server Error',
        message: err.message || 'Something went wrong',
        //Only show the full stack trace in dev mode, never in production 
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),

    });
};

module.exports = errorHandler;

