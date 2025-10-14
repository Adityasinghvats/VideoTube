import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    if (!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }
    const playlist = await Playlist.create({
        name,
        description,
        user: req.user._id,
    })
    if (!playlist) {
        throw new ApiError(500, "Failed to create playlist")
    }
    res.status(201).json(new ApiResponse(201, "Playlist created successfully", playlist))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }
    const playlists = await Playlist.find({ user: userId })
    if (!playlists) {
        throw new ApiError(404, "No playlists found")
    }
    res.status(200).json(new ApiResponse(200, "User playlists retrieved successfully", playlists))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    const playlist = await Playlist.findById(playlistId).populate("videos")
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    res.status(200).json(new ApiResponse(200, "Playlist retrieved successfully", playlist))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist ID or video ID")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    if (req.user._id.toString() !== playlist.owner.toString()) {
        throw new ApiError(403, "You are not authorized to modify this playlist")
    }
    /*
    Using MongoDB Aggregation to update the playlist:
    1. `$match`: Finds the playlist document with the given playlistId.
    2. `$addFields`: Adds or updates the `videos` array.
       - `$setUnion`: Ensures that the video is added only if it's not already in the array.
       - Converts videoId into an ObjectId before adding.
    3. `$merge`: Updates the existing playlist document in the `playlists` collection.
  */
    const updatePlaylist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId),
            },
        },
        {
            $addFields: {
                videos: {
                    $setUnion: ["$videos", [new mongoose.Types.ObjectId(videoId)]],
                },
            },
        },
        {
            $merge: {
                into: "playlists",
            },
        },
    ]);
    if (!updatePlaylist) {
        throw new ApiError(500, "Failed to add video to playlist")
    }
    return res.status(200).json(new ApiResponse(200, "Video added to playlist successfully", updatePlaylist))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist ID or video ID")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    if (req.user._id.toString() !== playlist.owner.toString()) {
        throw new ApiError(403, "You are not authorized to modify this playlist")
    }
    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: new mongoose.Types.ObjectId(videoId) } },
        { new: true }
    )
    if (!updatePlaylist) {
        throw new ApiError(500, "Failed to remove video from playlist")
    }
    return res.status(200).json(new ApiResponse(200, "Video removed from playlist successfully", updatePlaylist))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    if (req.user._id.toString() !== playlist.owner.toString()) {
        throw new ApiError(403, "You are not authorized to modify this playlist")
    }
    const deletePlaylist = await Playlist.findByIdAndDelete(playlistId);
    if (!deletePlaylist) {
        throw new ApiError(500, "Failed to delete playlist")
    }

    return res.status(200).json(new ApiResponse(200, "Playlist deleted successfully", deletePlaylist))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    if (!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    if (req.user._id.toString() !== playlist.owner.toString()) {
        throw new ApiError(403, "You are not authorized to modify this playlist")
    }
    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $set: { name, description } },
        { new: true }
    )
    if (!updatePlaylist) {
        throw new ApiError(500, "Failed to update playlist")
    }
    return res.status(200).json(new ApiResponse(200, "Playlist updated successfully", updatePlaylist))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}