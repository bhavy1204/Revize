// controllers/extensionAuth.controller.js
import crypto from "crypto";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js"; // use whatever response wrapper you already have
import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";

function generateToken() {
    const raw = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(raw).digest("hex");
    return { raw, hash };
}

// POST /api/v1/auth/extension-token  (protected by verifyJwt — user is on the PWA, logged in via cookie)
export const createExtensionToken = asyncHandler(async (req, res) => {
    const { raw, hash } = generateToken();

    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            extensionTokenHash: hash,
            extensionTokenCreatedAt: new Date()
        }
    });

    return res.status(200).json(
        new APIResponse(200, {
            token: raw,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email
            }
        }, "Extension token generated")
    );
});

// POST /api/v1/auth/extension-token/revoke  (protected by verifyJwt)
export const revokeExtensionToken = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $unset: { extensionTokenHash: "", extensionTokenCreatedAt: "" }
    });

    return res.status(200).json(new APIResponse(200, {}, "Extension disconnected"));
});

