console.log("rvize: content script loaded on LeetCode");

const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject.js");
script.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(script);

window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.data?.source !== "revize-inject") return;

    if (event.data.type === "PROBLEM_SOLVED") {
        console.log("📨 Revize: relaying solved problem to background", event.data.payload);
        chrome.runtime.sendMessage({
            type: "PROBLEM_SOLVED",
            payload: event.data.payload
        });
    }
});


