// frontend/src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // The context path you want to proxy
    createProxyMiddleware({
      target: 'http://localhost:5001', // Your backend server address
      changeOrigin: true,
    })
  );
  // If you store images in backend/uploads and want to serve them directly for <img> tags
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
    })
  );
};