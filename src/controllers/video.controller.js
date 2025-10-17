import { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { getVideoDuration } from "../utils/ffmpeg.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType } = req.query
    if (!req.user) {
        throw new ApiError(401, "User not found")
    }

    const match = {
        ...(query ? { title: { $regex: query, $options: "i" } } : {}),//if query exists, match titles that contains the searchterm (case-insensitive)
    }

    const videos = await Video.aggregate([
        { $match: match },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1, // Thumbnail image link
                title: 1, // Video title
                description: 1, // Video description
                duration: 1, // Video duration
                views: 1, // Number of views
                isPublished: 1, // Whether the video is published or not
                owner: 1,
            }
        },
        {
            $sort: {
                [sortBy]: sortType === "desc" ? -1 : 1,
            }
        },
        {
            $skip: (page - 1) * parseInt(limit),
        },
        {
            $limit: parseInt(limit),
        }
    ])
    if (!videos?.length) {
        throw new ApiError(404, "Videos are not found");
    }

    // Sending the response with a success message
    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
})

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    if (!req.user) {
        throw new ApiError(401, "User not authenticated");
    }
    const owner = req.user._id;
    if (!title) {
        throw new ApiError(400, "Title cannot be empty")
    }
    if (!description) {
        throw new ApiError(400, "Description cannot be empty")
    }
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    if (!videoFileLocalPath) {
        throw new ApiError(400, "VideoFile is required")
    }
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }
    try {
        const duration = await getVideoDuration(videoFileLocalPath);
        const [videoFile, thumbnail] = await Promise.all([
            uploadOnCloudinary(videoFileLocalPath),
            uploadOnCloudinary(thumbnailLocalPath)
        ]);
        if (!videoFile) {
            throw new ApiError(400, "Cloudinary error: Video file is required");
        }
        if (!thumbnail) {
            throw new ApiError(400, "Cloudinary error: Thumbnail file is required")
        }
        const video = await Video.create({
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            title,
            description,
            owner,
            duration,
        })

        if (!video) {
            throw new ApiError(500, "Somwthing went wrong while publishing video")
        }
        return res
            .status(201)
            .json(new ApiResponse(201, video, "Video uploaded successfully"))
    } catch (error) {
        throw new ApiError(500, error);
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const video = await Video.findById(videoId).populate("owner", "name email");
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    let updateData = { title, description }
    if (req.file) {
        const thumbnailLocalPath = req.file.path;
        if (!thumbnailLocalPath) {
            throw new ApiError(400, "Thumbnail is required");
        }
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnail.url) {

            throw new ApiError(400, "Cloudinary error: Thumbnail file is required")
        }
        updateData.thumbnail = thumbnail.url;
    }
    const updateVideo = await Video.findByIdAndUpdate(
        { _id: videoId, owner: req.user?._id },
        { $set: updateData },
        { new: true, runValidators: true }
    )
    if (!updateVideo) {
        throw new ApiError(404, "Video not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, updateVideo, "Video updated successfully"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const video = await Video.findByIdAndDelete(
        {
            _id: videoId,
            owner: req.user?._id
        }
    )
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const video = await Video.findById(videoId);

    if (req.user._id.toString() !== video.owner.toString()) {
        throw new ApiError(403, "You are not authorized to perform this action");
    }
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    video.isPublished = !video.isPublished;
    await video.save();
    return res
        .status(200)
        .json(new ApiResponse(200, video, `Video ${video.isPublished ? "published" : "unpublished"} successfully`));
})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}