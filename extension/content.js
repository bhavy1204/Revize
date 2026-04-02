console.log("🚀 Content script loaded");

// inject script into page context
const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject.js");
script.onload = function () {
    this.remove();
};

(document.head || document.documentElement).appendChild(script);

// listen from injected script
window.addEventListener("message", (event) => {

    if (event.source !== window) return;

    if (event.data.type === "PROBLEM_SOLVED") {

        chrome.runtime.sendMessage({
            type: "PROBLEM_SOLVED",
            payload: event.data.payload
        });
    }
});