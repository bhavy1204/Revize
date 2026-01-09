import { User } from "../models/user.model.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import { Task } from "../models/task.model.js"
import { generateAccessAndRefreshToken } from "../utils/auth.js"
import { asyncHandler } from "../utils/AsyncHandler.js"

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

    return res.status(201).json(
        new APIResponse(201, createdUser, "User registerd Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!(email && password)) {
        throw new APIError(400, "email and password required")
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new APIError(404, "No such user exists")
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
        throw new APIError(401, "Token required")
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decoded?._id).select("-password")

    if (!user) {
        throw new APIError(404, "No such user exists")
    }

    res.status(200).json(
        new APIResponse(200, user, "User authenticated")
    )

})


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

    const incomingToken = req.cookies?.refreshToken || req.body.refreshToken

    if (!incomingToken) {
        throw new APIError(404, "Incoming Token required")
    }

    const decodedToken = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET)

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
    loginUser,
    authMe,
    logout,
    refreshToken,
    changePassword,
    getCurrentUser,
    deleteAccount
}