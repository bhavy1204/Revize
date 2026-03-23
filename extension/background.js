console.log("Background running...");

chrome.runtime.onMessage.addListener(async (message) => {
    if (message.type === "PROBLEM_SOLVED") {

        console.log("📩 Received in background:", message.payload);

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