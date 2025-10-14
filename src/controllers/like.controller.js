import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }
    const existingLike = await Like.findOne({
        likedBy: userId,
        video: videoId
    })
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponse(200, "Video unliked successfully", {}))
    }
    const likeVideo = await Like.create({
        likedBy: userId,
        video: videoId
    })
    res.status(201).json(new ApiResponse(201, "Video liked successfully", likeVideo))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user._id

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }
    const existingLike = await Like.findOne({
        likedBy: userId,
        comment: commentId
    })
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponse(200, "Comment unliked successfully", {}))
    }
    const likeComment = await Like.create({
        likedBy: userId,
        comment: commentId
    })
    res.status(201).json(new ApiResponse(201, "Comment liked successfully", likeComment))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const userId = req.user._id

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }
    const existingLike = await Like.findOne({
        likedBy: userId,
        tweet: tweetId
    })
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponse(200, "Tweet unliked successfully", {}))
    }
    const likeTweet = await Like.create({
        likedBy: userId,
        tweet: tweetId
    })
    res.status(201).json(new ApiResponse(201, "Tweet liked successfully", likeTweet))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const likedVideos = await Like.find({
        likedBy: userId,
        video: { $exists: true }
    },
    ).populate("video", "_id title url");//populate replaces the video id with actual video details
    res.status(200).json(new ApiResponse(200, "Liked videos fetched successfully", likedVideos));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}