import c from "./cloudinaryConfig.js";

const deleteFromCloduinary = async (publicId)=>{
    if(!publicId){
        console.error("Public ID required to delete")
        return null;
    }

    try {
        await c.uploader.destroy(publicId,{
            resource_type:"auto"
        })
    } catch (error) {
        console.error("cloduianry deletion failed ", error.message)
    }
}

export {deleteFromCloduinary}
