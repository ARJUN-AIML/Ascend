const { captureError } = require('../utils/telemetry');

const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  // 1. Timeout Errors (from connect-timeout)
  if (err.timeout) {
    statusCode = 503;
    error.message = 'Service Unavailable: Request timed out.';
  }

  // 2. Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    error.message = 'Resource not found';
  }

  // 3. Mongoose Duplicate Key
  if (err.code === 11000) {
    statusCode = 409;
    error.message = 'Duplicate field value entered';
  }

  // 4. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map(val => val.message);
    error.message = messages.join('. ');
  }

  // 5. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    error.message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    error.message = 'Your token has expired. Please log in again.';
  }
  
  // 6. Multer Errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    error.message = 'File too large. Maximum size is 5MB.';
  } else if (err.message === 'Invalid file type. Only PDF and DOC/DOCX are allowed.') {
    statusCode = 400;
  }
  
  // Log critical failures to Sentry
  if (statusCode === 500 || statusCode === 503 || err.name === 'JsonWebTokenError') {
    captureError(err, { 
      route: req.originalUrl, 
      method: req.method,
      user: req.user ? req.user.id : 'unauthenticated'
    });
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
