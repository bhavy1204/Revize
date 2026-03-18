import mongoose, { Types } from "mongoose";

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        lowercase:true,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    expiresAt:{
        type: Date,
        expires:300
    }
}, {timestamps:true})

export const Otp = mongoose.model("Otp", otpSchema)


