// backend/middleware/errorMiddleware.js

// For routes that don't exist (404)
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); // Pass error to the next error handling middleware
  };
  
  // General error handler
  const errorHandler = (err, req, res, next) => {
    // Sometimes an error might come with a status code, otherwise default to 500
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
      message: err.message,
      // Show stack trace only in development mode
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  };
  
  export { notFound, errorHandler };