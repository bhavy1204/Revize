import { APIResponse } from "../utils/APIResponse";
import { asyncHandler } from "../utils/AsyncHandler";

const healthCheck = asyncHandler((req,res)=>{
    return res.status(200).json(
        new APIResponse(200, "All Working")
    )
})

export {healthCheck}
