import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Tweet cannot be empty")
    }
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError(401, "User not found")
    }
    const tweet = await Tweet.create({ content, owner: userId })
    if (!tweet) {
        throw new ApiError(500, "Something went wrong creating tweet")
    }
    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user Id")
    }
    const tweets = await Tweet.find({
        owner: userId
    }).sort({ createdAt: -1 })
    if (!tweets || tweets.length === 0) {
        throw new Error(404, "Tweets not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.params;
    const userId = req.user._id;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet Id")
    }
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }
    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Tweets cannot be accessed")
    }
    const updateTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: { content },
        },
        { new: true }
    )
    if (!updateTweet) {
        throw new ApiError(500, "Something went wrong updating tweet")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, updateTweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }
    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Tweets cannot be accessed")
    }
    const deleteTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deleteTweet) {
        throw new ApiError(500, "Something went wrong while deleting")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deleteTweet, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}