import ApiCLient from "./api.js";

// const apiClient = new ApiCLient();

export const subscribeUser = async () => {
    const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

    const registration = await navigator.serviceWorker.register("/sw.js");

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
        throw new Error("Permission denied");
    }

    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const subData = {
        endPoint: subscription.endpoint,
        keys: {
            p256dh: subscription.toJSON().keys.p256dh,
            auth: subscription.toJSON().keys.auth,
        },
    };

    console.log("📡 Sending subscription sub data:", subData);

    await fetch("http://localhost:3000/api/v1/notification/subscribe", {
        method: "POST",
        body: JSON.stringify(subData),
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    return subscription;
};

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}