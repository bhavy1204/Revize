import { User } from "../models/user.model.js";
import { APIError } from "./APIError.js";

const generateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new APIError(404, "user not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken }
}



export { generateAccessAndRefreshToken };