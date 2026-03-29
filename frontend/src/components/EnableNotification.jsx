import { useEffect, useState } from "react";
import { subscribeUser } from "../utils/push.js";

function EnableNotifications() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (Notification.permission === "granted") {
      setEnabled(true);
    }
  }, []);

  const handleClick = async () => {
    try {
      await subscribeUser();
      setEnabled(true);
      alert("Notifications enabled 🚀");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={enabled}
      className={`font-bold py-2 px-4 rounded text-white ${
        enabled
          ? "bg-green-600 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {enabled ? "Notifications Enabled" : "Enable Notifications"}
    </button>
  );
}

export default EnableNotifications;