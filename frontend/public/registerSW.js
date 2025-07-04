// registerSW.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then((registration) => {
      console.log('Service Worker registado:', registration);
    })
    .catch((error) => {
      console.log('Falha ao registar Service Worker:', error);
    });
}