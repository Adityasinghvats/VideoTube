import { v2 as cloudinary } from 'cloudinary';
import fs from "fs/promises";;
import dotenv from 'dotenv';
import { logger } from '../logger.js';
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
        logger.info("file is uploaded: at src", response.url)
        return response;
    } catch (error) {
        logger.error("Error on cloudinary upload", error)
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
        logger.info("deleted from cloudinary", publicId);

    } catch (error) {
        logger.error("error deleting cloudinary", error);
        return null
    }
}

export { uploadOnCloudinary, deleteFromCloudinary };