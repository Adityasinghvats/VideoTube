import { v2 as cloudinary } from 'cloudinary';
import fs from "fs/promises";;
import dotenv from 'dotenv';
dotenv.config()

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) return null;
        const response = await cloudinary.uploader.upload(
            localfilepath,
            {
                resource_type: 'auto'
            }
        )
        console.log("file is uploaded: at src", response.url)
        return response;
    } catch (error) {
        console.log("Error on cloudinary upload", error)
        return null;
    } finally {
        try {
            await fs.unlink(localfilepath);
        } catch (error) {
            if (error.code !== 'ENOENT') console.error("failed to remove temp file:", localfilepath, error);
        }
    }
}

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        console.log("deleted from clodudinary", publicId);

    } catch (error) {
        console.log("error deleting cloudinary", error);
        return null
    }
}

export { uploadOnCloudinary, deleteFromCloudinary };