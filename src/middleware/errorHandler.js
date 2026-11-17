const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  // Log full stack trace internally
  logger.error(`${req.method} ${req.url} - ${err.message}`, err.stack);

  // 1. JSON Body Parser Syntax Error (malformed JSON payload)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Malformed JSON payload syntax.'
      }
    });
  }

  // 2. Multer File Upload Errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'File size exceeds maximum limit of 8 MB.'
      }
    });
  }
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message
      }
    });
  }

  // 3. Mongoose Schema Validation Errors
  if (err.name === 'ValidationError') {
    const details = Object.keys(err.errors).map(field => ({
      field: field,
      issue: err.errors[field].message
    }));

    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed for one or more fields.',
        details: details
      }
    });
  }

  // 4. Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: `An entry with this ${field} already exists.`
      }
    });
  }

  // 5. Mongoose CastError (e.g. malformed ObjectId query)
  if (err.name === 'CastError') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Resource with identifier '${err.value}' was not found.`
      }
    });
  }

  // 6. Generic Custom Application Errors
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');

  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected internal server error occurred.'
    }
  });
}

module.exports = errorHandler;
