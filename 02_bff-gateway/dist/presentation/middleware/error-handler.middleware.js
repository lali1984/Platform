"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandlerMiddleware = void 0;
class ErrorHandlerMiddleware {
}
exports.ErrorHandlerMiddleware = ErrorHandlerMiddleware;
ErrorHandlerMiddleware.handleNotFound = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString(),
    });
};
ErrorHandlerMiddleware.handleError = (error, req, res, next) => {
    console.error('Unhandled error:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
    });
    // Determine status code
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    if (error.statusCode) {
        statusCode = error.statusCode;
        errorMessage = error.message;
    }
    else if (error.name === 'ValidationError') {
        statusCode = 400;
        errorMessage = error.message;
    }
    else if (error.name === 'UnauthorizedError') {
        statusCode = 401;
        errorMessage = 'Unauthorized';
    }
    else if (error.name === 'ForbiddenError') {
        statusCode = 403;
        errorMessage = 'Forbidden';
    }
    else if (error.code === 'ECONNREFUSED') {
        statusCode = 503;
        errorMessage = 'Service unavailable';
    }
    // Don't expose stack trace in production
    const response = {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
    };
    if (process.env.NODE_ENV !== 'production') {
        response.stack = error.stack;
        response.details = {
            name: error.name,
            code: error.code,
        };
    }
    res.status(statusCode).json(response);
};
ErrorHandlerMiddleware.validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const { error, value } = schema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const validationErrors = error.details.map((detail) => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                }));
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    validationErrors,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Replace body with validated values
            req.body = value;
            next();
        }
        catch (validationError) {
            console.error('Request validation error:', validationError);
            res.status(400).json({
                success: false,
                error: 'Invalid request format',
                timestamp: new Date().toISOString(),
            });
        }
    };
};
