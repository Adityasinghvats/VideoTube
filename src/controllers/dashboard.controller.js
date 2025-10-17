import mongoose from "mongoose"
import { Video } from "../models/video.models.js"
import { Like } from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    // find all videos where user is owner and then for all those videos aggregate views and count them
    // find count of all Subscriptions where channel value is same as user
    // find count of all the likes for comments and video where video owner is user
    // find count of all the likes for tweets where owner is user
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    // find all videos where the owner is current user and return the array of videos
    const { page = 1, limit = 10, query, sortBy, sortType } = req.query
    const userId = req.user._id
    if (!userId) {
        throw new ApiError(401, "User not found")
    }

    const match = {
        ...(query ? { title: { $regex: query, $options: "i" } } : {}),//if query exists, match titles that contains the searchterm (case-insensitive)
        ...(userId ? { owner: mongoose.Types.ObjectId(userId) } : {}),
    }

    const videos = await Video.aggregate([
        { $match: match },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "VideosByOwner",
            },
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1, // Thumbnail image link
                title: 1, // Video title
                description: 1, // Video description
                duration: 1, // Video duration
                views: 1, // Number of views
                isPublished: 1, // Whether the video is published or not
                owner: {
                    $arrayElemAt: ["$videosByOwner", 0], // Extracts the first user object from the array
                },
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

export {
    getChannelStats,
    getChannelVideos
}