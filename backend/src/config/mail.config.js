import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config();

console.log(process.env.EMAIL);
console.log(process.env.EMAIL_PASS);

export const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    }
})
