import { subscribeUser } from "../utils/push.js";

function EnableNotifications() {
  const handleClick = async () => {
    try {
      await subscribeUser();
      alert("Notifications enabled 🚀");
    } catch (err) {
      console.error(err);
    }
  };

  return <button onClick={handleClick}>Enable Notifications</button>;
}

export default EnableNotifications;
