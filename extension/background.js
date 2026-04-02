console.log("Background running...");

const API_BASE = "http://localhost:3000/api/v1";

async function checkAuth() {
    try {
        const res = await fetch(`${API_BASE}/auth/me`, {
            method: "GET",
            credentials: "include"
        });

        if (!res.ok) throw new Error("Not logged in");

        const data = await res.json();

        await chrome.storage.local.set({
            revizeLoggedIn: true,
            revizeUser: data.user
        });

        console.log("✅ Revize Authenticated:", data.user);

    } catch (err) {

        await chrome.storage.local.set({
            revizeLoggedIn: false,
            revizeUser: null
        });

        console.log("⚠️ Revize user not logged in");
    }
}

// run auth check when extension loads
checkAuth();



chrome.runtime.onMessage.addListener(async (message) => {

    if (message.type === "PROBLEM_SOLVED") {

        const { revizeLoggedIn } = await chrome.storage.local.get("revizeLoggedIn");

        if (!revizeLoggedIn) {
            console.log("⚠️ User not logged in. Skipping sync.");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/api/v1/task/leetcode/create-task", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(message.payload)
            });

            const data = await res.json();

            console.log("✅ Saved to backend:", data);

        } catch (err) {
            console.error("❌ Backend error:", err);
        }
    }
});