import { User } from "../models/user.model.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import { Task } from "../models/task.model.js"
import { generateAccessAndRefreshToken } from "../utils/auth.js"
import { asyncHandler } from "../utils/AsyncHandler.js"
import { OAuth2Client } from "google-auth-library"
import { generateFromEmail } from "unique-username-generator"
import { generateOTP } from "../utils/otp.js"
import { Otp } from "../models/otp.model.js"
import { transporter } from "../config/mail.config.js"
import { VerifiedEmail } from "../models/verifiedEmail.model.js"

const registerUser = asyncHandler(async (req, res) => {
    const { email, username, fullName, password } = req.body;

    if ([email, password, username, fullName].some((field) => field?.trim() === "")) {
        throw new APIError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        throw new APIError(409, "User already exists");
    }

    const verified = await VerifiedEmail.findOne({ email });

    if (!verified) {
        throw new APIError(403, "Email not verified");
    }

    const user = await User.create({
        fullName,
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new APIError(500, "SOmething went wrong while registring User");
    }

    await VerifiedEmail.deleteOne({ email });

    return res.status(201).json(
        new APIResponse(201, createdUser, "User registerd Successfully")
    )

})

const sendOtp = asyncHandler(async (req, res) => {
    console.log("OTP REACHED")
    const { email } = req.body;

    if (!email || !email.includes("@")) {
        throw new APIError(400, "Invalid email");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new APIError(409, "User already verified");
    }

    const otp = generateOTP();

    await Otp.deleteMany({ email });

    await Otp.create({
        email,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    })

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Your OTP Code",
        html: `<h2>${otp}</h2><p>Expires in 5 mins</p>`,
    })

    return res.status(200).json(
        new APIResponse(200,null, "Email send success")
    )

})


const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !email.includes("@")) {
        throw new APIError(400, "Invalid email");
    }

    if(!otp){
        throw new APIError(400, "Otp required")
    }

    const record = await Otp.findOne({email, otp})

    if(!record){
        throw new APIError(404, "Invalid OTP ")
    }

    if(record.expiresAt< new Date()){
        throw new APIError(403, "OTP expired")
    }

    await VerifiedEmail.findOneAndUpdate(
        { email },
        {
            email,
            verifiedAt: new Date(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        },
        { upsert: true }
    );

    await Otp.deleteOne({_id:record._id});

    return res.status(200).json(
        new APIResponse(200, null, "OTP verified")
    )

})

const oAuthCallback = asyncHandler(async (req, res) => {
    // const { idToken } = req.body;

    // if (!idToken) {
    //     throw new APIError(400, "Google ID token is required");
    // }

    // let payload;
    // try {
    //     const ticket = await googleClient.verifyIdToken({
    //         idToken,
    //         audience: process.env.GOOGLE_CLIENT_ID,
    //     });
    //     payload = ticket.getPayload();
    // } catch {
    //     throw new APIError(401, "Invalid Google token");
    // }

    // const { sub: providerId, email, name, email_verified } = payload;

    // if (!email_verified) {
    //     throw new APIError(400, "Google account email is not verified");
    // }

    // // upsert: find existing user or create new one
    // let user = await User.findOne({ email });

    // if (user && !user.isOAuth) {
    //     throw new APIError(400, "This email is registered with a password. Please login with email and password.");
    // }

    // if (!user) {
    //     user = await User.create({
    //         fullName: name,
    //         email,
    //         isOAuth: true,
    //         authProvider: "google",
    //         providerId,
    //         isEmailVerified: true, // Google already verified it
    //     });
    // }

    // const { accessToken, refreshToken } = await generateTokens(user);

    // return res
    //     .status(200)
    //     .cookie("accessToken", accessToken, COOKIE_OPTIONS)
    //     .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    //     .json(
        //     new APIResponse(
        //         200,
        //         { _id: user._id, fullName: user.fullName, email: user.email },
        //         "Logged in with Google successfully"
        //     )
        // );
});

const githubAuth = asyncHandler(async (req, res) => {
    // const { sub, email, name } = req.auth0User;

    // let user = await User.findOne({ authId: sub });

    // if (!user) {
    //     const username = generateFromEmail(email, { randomDigits: 2, stripLeadingDigits: true });
    //     user = await User.create({
    //         username,
    //         fullName: name,
    //         email,
    //         authId: sub,
    //         authProvider: "github",
    //         isOAuth: true,
    //         isEmailVerified: true,
    //     });
    // }

    // const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // const accessOptions = {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production",
    //     sameSite: "lax",
    //     maxAge: 15 * 60 * 1000,
    // };

    // const refreshOptions = {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production",
    //     sameSite: "lax",
    //     maxAge: 7 * 24 * 60 * 60 * 1000,
    // };

    // res
    //     .status(200)
    //     .cookie("accessToken", accessToken, accessOptions)
    //     .cookie("refreshToken", refreshToken, refreshOptions)
    //     .json(
    //         new APIResponse(
    //             200,
    //             { user: loggedInUser },
    //             "User logged in via GitHub"
    //         )
    //     );

});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!(email && password)) {
        throw new APIError(400, "email and password required")
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new APIError(404, "No such user exists")
    }

    if (user.isOAUth) {
        throw new APIError(400, "This account uses Google login. Use Continue with Google.");
    }

    const isValidPassword = await user.isPasswordCorrect(password);

    if (!isValidPassword) {
        throw new APIError(400, "Password incoorect")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // console.log(loggedInUser);

    const accessTokenExpiry = 20 * 60 * 1000;
    const refreshTokenExpiry = 7 * 24 * 60 * 60 * 1000;

    const accessOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: accessTokenExpiry
    }

    const refreshOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: refreshTokenExpiry
    }

    return res.status(200)
        .cookie("accessToken", accessToken, accessOptions)
        .cookie("refreshToken", refreshToken, refreshOptions)
        .json(
            new APIResponse(200, { user: loggedInUser }, "User loggedIn successfully")
        )

})

//Who is this request really coming from, and are they legit?
const authMe = asyncHandler(async (req, res) => {
    const token = req.cookies?.accessToken || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        throw new APIError(401, "Token required");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        throw new APIError(401, "Invalid or expired token");
    }

    const user = await User.findById(decoded?._id).select("-password");

    if (!user) {
        throw new APIError(404, "No such user exists");
    }

    res.status(200).json(new APIResponse(200, user, "User authenticated"));
});


const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            refreshToken: null
        }
    })

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new APIResponse(200, {}, "user logged out successfully")
        )
})

const refreshToken = asyncHandler(async (req, res) => {

    console.log("USER REACHED TO REFRESH TOKEN CONTROLLER")

    const incomingToken = req.cookies?.refreshToken || req.body.refreshToken

    if (!incomingToken) {
        throw new APIError(404, "Incoming Token required")
    }

    const decodedToken = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET)

    console.log("Decoding done ")

    const user = await User.findById(decodedToken?._id).select("-password")

    if (!user) {
        throw new APIError(404, "No such user exists")
    }

    if (user.refreshToken !== incomingToken) {
        throw new APIError(401, "Invalid Token")
    }

    const accessTokenExpiry = 20 * 60 * 1000
    const refreshTokenExpiry = 7 * 24 * 60 * 60 * 1000

    const accessOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: accessTokenExpiry
    }

    const refreshOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: refreshTokenExpiry
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    return res.status(200)
        .cookie("accessToken", accessToken, accessOptions)
        .cookie("refreshToken", refreshToken, refreshOptions)
        .json(
            new APIResponse(200, { accessToken, refreshToken, message: "Access token refreshed" })
        )

})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new APIError(404, "Old and New password required")
    }

    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new APIError(404, "No such user exists")
    }

    const isCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isCorrect) {
        throw new APIError(400, "Old password incoorect")
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new APIResponse(200, "password changed successfully")
    )

})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) {
        throw new APIError(404, "User does not exists")
    }

    return res.status(200).json(
        new APIResponse(200, user, "User fetched successfully")
    )
})

const deleteAccount = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) {
        throw new APIError(401, "User does not exists")
    }

    const deletedUser = await User.findByIdAndDelete(user._id);

    if (!deletedUser) {
        throw new APIError(500, "Some error while deleting user")
    }

    return res.status(200)
        .json(
            new APIResponse(200, null, "User Deleted succesfully")
        )
})

export {
    registerUser,
    sendOtp,
    verifyOtp,
    githubAuth,
    loginUser,
    authMe,
    logout,
    refreshToken,
    changePassword,
    getCurrentUser,
    deleteAccount
}