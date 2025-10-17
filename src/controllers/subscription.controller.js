import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const subscriberId = req.user._id
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }
    if (subscriberId.toString() === channelId.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself")
    }
    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId,
    })
    if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id)
        res.status(200).json(new ApiResponse(200, "Unsubscribed successfully", {}))
    }
    const newSubscription = await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
    })
    res.status(201).json(new ApiResponse(201, "Subscribed successfully", newSubscription))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const channelId = req.user._id;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }
    const subscribers = await Subscription.find({
        channel: channelId,
    }).populate("subscriber", "_id name email")
    if (!subscribers || subscribers.length === 0) {
        throw new ApiError(404, "No subscribers found for this channel")
    }
    res.status(200).json(new ApiResponse(200, "Subscribers fetched successfully", subscribers))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const subscriberId = req.user._id;
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId")
    }
    const subscriptions = await Subscription.find({
        subscriber: subscriberId
    }).populate("channel", "_id name email")
    if (!subscriptions || subscriptions.length === 0) {
        throw new ApiError(404, "No channels found for this user")
    }
    res.status(200).json(new ApiResponse(200, "Subscribed channels fetched successfully", subscriptions))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}