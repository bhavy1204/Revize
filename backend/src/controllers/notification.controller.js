import { PushSubscription } from "../models/pushSubscription.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { sendPushToAll } from "../service/push.service.js";

const pushToAll = asyncHandler(async(req,res)=>{
    const {endPoint, keys} = req.body;

    if (!endPoint) {
        throw new APIError(404, "Endpoint are required")
    }

    if (!keys) {
        throw new APIError(404, " keys are required")
    }

    const existing = await PushSubscription.findOne({endPoint})

    if(!existing){
        await PushSubscription.create({
            user: req.user?._id,
            endpoint:endPoint,
            keys
        })
    }

    res.status(200).json(
        new APIResponse(200, null, "Pushed to all")
    )


})

const sendTestNotification = async (req, res) => {
    try {
        await sendPushToAll({
            title: "Test Notification 🚀",
            body: "If you see this, it works!",
            url: "/",
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export {
    pushToAll,
    sendTestNotification
}