self.addEventListener("push", (event) => {
    const data = event.data.json();

    console.log("🔥 Push received!", event);
    console.log("📦 Data:", data);

    self.registration.showNotification(data.title, {
        body: data.body,
        icon: "./pwa-192.png",
        badge: "./pwa-192.png",
        data: {
            url: data.url || "/",
        },
    });
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});