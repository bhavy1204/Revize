console.log("revize: auth bridge loaded on PWA");

window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.data?.source !== "revize-pwa") return;

    if (event.data.type === "REVIZE_CONNECT" && event.data.token) {
        chrome.runtime.sendMessage(
            {
                type: "REVIZE_CONNECT",
                token: event.data.token,
                user: event.data.user || null
            },
            (response) => {
                window.postMessage(
                    { source: "revize-extension", type: "REVIZE_CONNECTED", ok: !!response?.ok },
                    window.location.origin
                );
            }
        );
    }

    if (event.data.type === "REVIZE_DISCONNECT") {
        chrome.runtime.sendMessage({ type: "REVIZE_DISCONNECT" });
    }
});

window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.data?.source !== "revize-pwa") return;
    if (event.data.type !== "REVIZE_STATUS_REQUEST") return;

    chrome.runtime.sendMessage({ type: "REVIZE_STATUS_REQUEST" }, (response) => {
        window.postMessage(
            {
                source: "revize-extension",
                type: "REVIZE_STATUS",
                connected: !!response?.connected,
                user: response?.user || null
            },
            window.location.origin
        );
    });
});
