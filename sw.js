self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '🍺 Banged Up Alarm!';
  const options = {
    body: data.body || 'Someone is getting banged up!',
    icon: data.icon || '/icon.png',
    badge: data.badge || '/icon.png',
    vibrate: [200, 100, 200, 100, 400],
    tag: 'banged-up',
    renotify: true,
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let client of clientList) {
        if (client.url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(event.notification.data.url || '/');
    })
  );
});
