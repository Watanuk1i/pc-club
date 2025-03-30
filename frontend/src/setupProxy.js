const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/ajax_PS',
    createProxyMiddleware({
      target: 'https://cyberx146.langame-pr.ru',
      changeOrigin: true,
      secure: false
    })
  );
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://cyberx146.langame-pr.ru',
      changeOrigin: true,
      secure: false
    })
  );

  // WebSocket прокси для уведомлений
  app.use(
    '/ws',
    createProxyMiddleware({
      target: 'wss://cyberx146.langame-pr.ru',
      ws: true,
      changeOrigin: true,
      secure: false, // игнорируем SSL сертификат
    })
  );
}; 