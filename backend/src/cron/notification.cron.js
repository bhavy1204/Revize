// cron/notification.cron.js
import cron from "node-cron";
import { sendPushToAll } from "../service/push.service.js";

cron.schedule("0 8 * * *", async () => {
    await sendPushToAll({
        title: "Daily Reminder 🚀",
        body: "Open your app. Stay consistent.",
        url: "/dashboard",
    });
});