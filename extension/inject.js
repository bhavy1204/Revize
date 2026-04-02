console.log("🔥 Injected into page context");

// ---- FETCH ----
const originalFetch = window.fetch;

window.fetch = async (...args) => {
    const response = await originalFetch(...args);

    try {
        const url = args[0];

        if (typeof url === "string" && url.includes("/submissions/detail/")) {
            const clone = response.clone();
            const data = await clone.json();

            checkAccepted(data);
        }
    } catch (e) { }

    return response;
};

// ---- XHR ----
const originalOpen = XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.open = function (method, url) {
    this.addEventListener("load", function () {
        try {
            if (url.includes("/submissions/detail/")) {
                const data = JSON.parse(this.responseText);

                checkAccepted(data);
            }
        } catch (e) { }
    });

    return originalOpen.apply(this, arguments);
};

// ---- CHECK ----
function checkAccepted(data) {
    console.log("📡 Page response:", data);

    if (
        data?.status_msg === "Accepted" &&
        data?.state === "SUCCESS" &&
        data?.finished === true
    ) {
        // console.log("✅ ACCEPTED DETECTED (REAL)");

        const problem = {
            title: document.querySelector("h1")?.innerText || "Unknown",
            url: window.location.href,
            problemId: window.location.pathname.split("/")[2]
        };

        // send to content script
        window.postMessage(
            {
                type: "PROBLEM_SOLVED",
                payload: problem
            },
            "*"
        );
    }
}