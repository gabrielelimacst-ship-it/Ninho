/* Ninho: central de avisos (recebe as notificações mesmo com o app fechado) */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data.json(); } catch (_) { d = { corpo: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.titulo || 'Ninho', {
    body: d.corpo || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag || undefined, data: { url: './' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => {
    for (const c of l) if ('focus' in c) return c.focus();
    return self.clients.openWindow('./');
  }));
});
