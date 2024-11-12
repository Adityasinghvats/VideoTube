import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    const uploadOnCloudinary = async(localfilepath) => {
        try {
            if(!localfilepath) return null;
            const response = await cloudinary.uploader.upload(
                localfilepath,
                {
                    resource_type: 'auto'
                }
            )
            console.log("file is uploaded: at src", response.url)
            //once file is uploaded delete from local path
            fs.unlinkSync(localfilepath);
            return response;
        } catch (error) {
            fs.unlinkSync(localfilepath);
            return null;
        }
    }
    
export {uploadOnCloudinary};