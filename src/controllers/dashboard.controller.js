import mongoose from "mongoose"
import { Video } from "../models/video.models.js"
import { Like } from "../models/like.models.js"
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // find all videos where user is owner and then for all those videos aggregate views and count them
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError(401, "User not found")
    }
    const owner = new mongoose.Types.ObjectId(userId);

    const totalVideos = await Video.countDocuments({ owner });
    const totalViews = await Video.aggregate([
        { $match: { owner } },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ])
    // find count of all Subscriptions where channel value is same as user
    const totalSubscriptions = await Subscription.countDocuments({ channel: owner });
    // find count of all the likes for comments and video where video owner is user
    const totalLikesOnVideos = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        { $unwind: "$videoDetails" },
        {
            $match: {
                "videoDetails.owner": owner
            }
        }
    ])
    const totalLikesOnComments = await Like.aggregate([
        {
            $lookup: {
                from: "comments",
                localField: "comment",
                foreignField: "_id",
                as: "commentDetails"
            }
        },
        { $unwind: "$commentDetails" },
        {
            $match: {
                "commentDetails.owner": owner
            }
        }
    ])
    // find count of all the likes for tweets where owner is user
    const totalLikesOnTweets = await Like.aggregate([
        {
            $lookup: {
                from: "tweets",
                localField: "tweet",
                foreignField: "_id",
                as: "tweetDetails"
            }
        },
        { $unwind: "$tweetDetails" },
        {
            $match: {
                "tweetDetails.owner": owner
            }
        }
    ])
    const totalLikes = totalLikesOnVideos.length + totalLikesOnComments.length + totalLikesOnTweets.length;

    const stats = {
        totalVideos,
        totalViews: totalViews[0]?.totalViews || 0,
        totalSubscriptions,
        totalLikes
    }
    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Stats fetched successfully"));
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType } = req.query
    const userId = req.user._id
    if (!userId) {
        throw new ApiError(401, "User not found")
    }
    const allowedSortFields = ["createdAt", "views", "duration", "isPublished"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = sortType === "desc" ? 1 : -1;

    const match = {
        ...(query ? { title: { $regex: query, $options: "i" } } : {}),//if query exists, match titles that contains the searchterm (case-insensitive)
        ...(userId ? { owner: new mongoose.Types.ObjectId(userId) } : {}),
    }

    const videos = await Video.aggregate([
        { $match: match },
        {
            $lookup: {
                from: "users",
                let: { ownerId: "$owner" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$ownerId"] } } },
                    { $project: { password: 0, refreshToken: 0 } } // exclude sensitive fields here
                ],
                as: "videosByOwner"
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
            }
        },
        {
            $sort: {
                [sortField]: sortOrder,
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