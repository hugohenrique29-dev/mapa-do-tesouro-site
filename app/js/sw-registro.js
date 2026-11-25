// Registro do Service Worker em arquivo externo: web/_headers aplica `script-src 'self'` em /app/* (sem 'unsafe-inline').
(function () {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && !location.search.includes('sw=1')) return;
  const tinhaSW = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (tinhaSW) location.reload(); });
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
})();
