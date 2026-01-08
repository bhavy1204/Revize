import {APIError} from "../utils/APIError.js"
import {asyncHandler} from "../utils/AsyncHandler.js"
import jwt from "jsonwebtoken"
import {User }from "../models/user.model.js"


export const verifyJwt = asyncHandler(async (req,res,next)=>{
    const token = req.cookies?.accessToken || req.get("Authorization")?.replace("Bearer ", "").trim();

    if(!token){
        throw new APIError(401, "Unauthorised User: token missing");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new APIError(401, "Invalid or expired token");
    }

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if(!user){
        throw new APIError(404, "User does not exists");
    }

    req.user = user;
    next();

})









