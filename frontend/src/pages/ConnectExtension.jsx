import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000/api/v1";

export default function ConnectExtension() {
    const [status, setStatus] = useState("idle");
    const [message, setMessage] = useState("");

    const handleConnect = async () => {
        setStatus("loading");
        setMessage("");

        
        try {
            
            const res = await axios.post(
                `${API_BASE}/auth/extension-token`,
                {},
                { withCredentials: true }
            );

            const { token, user } = res.data.data;

            console.log(res)

            window.postMessage(
                {
                    source: "revize-pwa",
                    type: "REVIZE_CONNECT",
                    token,
                    user
                },
                window.location.origin
            );

            setStatus("success");
            setMessage(`Connected as ${user.name}. You can close this tab.`);
        } catch (err) {
            setStatus("error");
            setMessage(
                err?.response?.data?.message || "Failed to connect. Make sure you're logged in."
            );
        }
    };

    useEffect(() => {
        const listener = (event) => {
            if (event.source !== window) return;
            if (event.data?.source !== "revize-extension") return;
            if (event.data.type === "REVIZE_CONNECTED" && event.data.ok) {
                setMessage((prev) => prev + " ✓ Extension confirmed.");
            }
        };
        window.addEventListener("message", listener);
        return () => window.removeEventListener("message", listener);
    }, []);

    return (
        <div style={{ maxWidth: 420, margin: "80px auto", textAlign: "center", fontFamily: "sans-serif" }}>
            <h2>Connect Revize Extension</h2>
            <p style={{ color: "#666", fontSize: 14 }}>
                Click below to link this browser's extension to your Revize account.
            </p>
            <button
                onClick={handleConnect}
                disabled={status === "loading"}
                style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "#6366f1",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer"
                }}
            >
                {status === "loading" ? "Connecting..." : "Connect Extension"}
            </button>
            {message && (
                <p style={{ marginTop: 16, color: status === "error" ? "crimson" : "green" }}>
                    {message}
                </p>
            )}
        </div>
    );
}

