import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const healthCheck = asyncHandler((req,res)=>{
    return res.status(200).json(
        new APIResponse(200, "All Working")
    )
})

export {healthCheck}
