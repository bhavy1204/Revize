import mongoose from "mongoose";

const pushSubscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    endpoint: String,
    keys: {
        p256dh: String,
        auth: String,
    },
}, { timestamps: true });

export const PushSubscription = mongoose.model("PushSubscription", pushSubscriptionSchema);