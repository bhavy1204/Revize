import webpush from "web-push"
import { PushSubscription } from "../models/pushSubscription.model.js"

webpush.setVapidDetails(
    "mailto:bhavysarwa@gmail.com",
    process.env.PUSH_PUBLIC_KEY,
    process.env.PUSH_PRIVATE_KEY
)

export const sendPushToAll = async (payload) => {
    const subs = await PushSubscription.find();

    const results = await Promise.allSettled(
        subs.map((sub) => {
            const pushSub = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.keys.p256dh,
                    auth: sub.keys.auth,
                },
            };

            return webpush.sendNotification(pushSub, JSON.stringify(payload));
        })
    );

    results.forEach((res, idx) => {
        if (res.status === "rejected") {
            console.log("❌ Failed subscription:", subs[idx]);
            PushSubscription.findByIdAndDelete(subs[idx]._id).catch(() => { });
        }
    });

    console.log("Result of sendPushToAll >>>", results);
    
}


