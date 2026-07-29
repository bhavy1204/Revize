// console.log("revize background running");

const API_BASE = "http://localhost:3000/api/v1";

async function getToken() {
    const { revizeToken } = await chrome.storage.local.get("revizeToken");
    return revizeToken || null;
}

async function apiFetch(path, options = {}) {
    const token = await getToken();
    if (!token) throw new Error("Not connected");

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(options.headers || {})
        }
    });

    if (res.status === 401) {
        // token expired / invalid — clear stored auth
        await chrome.storage.local.set({ revizeToken: null, revizeUser: null });
        throw new Error("Unauthorized");
    }

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Request failed (${res.status}): ${text}`);
    }

    return res.json();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "REVIZE_CONNECT") {
        chrome.storage.local
            .set({ revizeToken: message.token, revizeUser: message.user || null })
            .then(() => {
                console.log("Revize: connected", message.user);
                sendResponse({ ok: true });
            });
        return true;
    }

    if (message.type === "REVIZE_DISCONNECT") {
        chrome.storage.local.set({ revizeToken: null, revizeUser: null }).then(() => {
            console.log("🔌 Revize: disconnected");
            sendResponse({ ok: true });
        });
        return true;
    }

    if (message.type === "REVIZE_STATUS_REQUEST") {
        chrome.storage.local.get(["revizeToken", "revizeUser"]).then(({ revizeToken, revizeUser }) => {
            sendResponse({ connected: !!revizeToken, user: revizeUser || null });
        });
        return true;
    }

    if (message.type === "PROBLEM_SOLVED") {
        handleProblemSolved(message.payload).then(
            (data) => sendResponse({ ok: true, data }),
            (err) => sendResponse({ ok: false, error: err.message })
        );
        return true;
    }
});

async function handleProblemSolved(payload) {
    const token = await getToken();

    if (!token) {
        console.log("Revize: not connected, skipping sync for", payload.title);
        return;
    }

    try {
        const data = await apiFetch("/task/leetcode/create-task", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        console.log("revize: saved to backend:", data);

        chrome.action.setBadgeText({ text: "✓" });
        chrome.action.setBadgeBackgroundColor({ color: "#22c55e" });
        setTimeout(() => chrome.action.setBadgeText({ text: "" }), 3000);

        return data;
    } catch (err) {
        console.error("❌ Revize: backend error:", err);
        chrome.action.setBadgeText({ text: "!" });
        chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
        setTimeout(() => chrome.action.setBadgeText({ text: "" }), 3000);
        throw err;
    }
}
