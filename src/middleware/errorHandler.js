function errorHandler(err, req, res, next) {
  console.error('[Error]', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // If request expects JSON or starts with /api
  if (req.path.startsWith('/api') || req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(statusCode).json({
      success: false,
      error: message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  // Otherwise render EJS error view
  res.status(statusCode).render('errors/500', {
    title: '500 - Server Error',
    currentPage: 'error',
    message,
    statusCode,
    error: process.env.NODE_ENV === 'development' ? err : null
  });
}

function notFoundHandler(req, res) {
  if (req.path.startsWith('/api') || req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(404).json({
      success: false,
      error: `Endpoint not found: ${req.method} ${req.originalUrl}`
    });
  }

  res.status(404).render('errors/404', {
    title: '404 - Page Not Found',
    currentPage: '404',
    url: req.originalUrl
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
