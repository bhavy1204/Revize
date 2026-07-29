import mongoose from "mongoose";

const verifiedEmailSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    verifiedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: 600
    }
});

verifiedEmailSchema.index({ email: 1 });

export const VerifiedEmail = mongoose.model("VerifiedEmail", verifiedEmailSchema);