import c from "./cloudinaryConfig.js";
import fs from "fs"

const uploadToCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath){
            console.error("Local file path required")
            return null;
        }
        const response = await c.uploader.upload(localFilePath,{
            resource_type:"auto"
        })

        try {
            fs.unlinkSync(localFilePath);
        } catch (error) {
            console.warn("file already deleted : ",localFilePath)
        }

        return response
    } catch (error) {
        try {
            fs.unlinkSync(localFilePath)
        } catch (error) {
            console.warn("file already deleted : ", localFilePath)
        }
        return null;
    }
}

export {uploadToCloudinary};



