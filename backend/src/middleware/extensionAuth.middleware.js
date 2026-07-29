import crypto from "crypto";
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";

export const extensionAuth = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const raw = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.replace("Bearer ", "")
        : null;

    if (!raw) {
        throw new APIError(401, "Unauthorized: extension token missing");
    }

    const hash = crypto.createHash("sha256").update(raw).digest("hex");

    const user = await User.findOne({ extensionTokenHash: hash }).select("-password -refreshToken");

    if (!user) {
        throw new APIError(401, "Invalid or revoked extension token");
    }

    req.user = user;
    next();
});

