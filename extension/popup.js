const PWA_URL = "http://localhost:5173";

const dot = document.getElementById("dot");
const statusText = document.getElementById("statusText");
const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");

async function refresh() {
    const { revizeToken, revizeUser } = await chrome.storage.local.get(["revizeToken", "revizeUser"]);

    if (revizeToken) {
        dot.classList.add("connected");
        statusText.textContent = revizeUser?.name ? `Connected as ${revizeUser.name}` : "Connected";
        connectBtn.style.display = "none";
        disconnectBtn.style.display = "block";
    } else {
        dot.classList.remove("connected");
        statusText.textContent = "Not connected";
        connectBtn.style.display = "block";
        disconnectBtn.style.display = "none";
    }
}

connectBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: `${PWA_URL}/connect-extension` });
});

disconnectBtn.addEventListener("click", async () => {
    await chrome.storage.local.set({ revizeToken: null, revizeUser: null });
    refresh();
});

refresh();
