import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { parse } from "dotenv"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }
    /*
    Convert videoId to ObjectId
    - MongoDB stores IDs as ObjectId, so we need to convert videoId (string) to ObjectId format.
    - This ensures correct matching in the database.
    */
    const videoObjectId = new mongoose.Types.ObjectId(videoId);

    const comments = await Comment.aggregate([
        {
            $match: {
                video: videoObjectId,
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "CommentOnWhichVideo",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "OwnerOfComment"
            }
        },
        {
            $project: {
                content: 1, // include the commnet content
                owner: {
                    $arrayElemAt: ["$OwnerOfComment", 0], //extract first element from owner array
                },
                video: {
                    $arrayElemAt: ["$CommentOnWhichVideo", 0],
                },
                createdAt: 1, //inlcude timestamp
            }
        },
        {
            $skip: (page - 1) * parseInt(limit),
        },
        {
            $limit: parseInt(limit),
        }
    ])
    console.log(`Fetched ${comments} for videoId: ${videoId}`);

    if (!comments?.length) {
        throw new ApiError(404, "Comments not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }

    if (!req.user) {
        throw new ApiError(401, "No user found")
    }

    if (!content) {
        throw new ApiError(400, "Empty or null fields are invalid");
    }

    const addComment = await Comment.create({
        content,
        owner: req.user?.id,
        video: videoId
    });
    if (!addComment) {
        throw new ApiError(500, "Something went wrong while adding comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, addComment, videoId, "Comment added successfully"));
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment Id");
    }
    if (!req.user) {
        throw new ApiError(401, "No user found")
    }
    if (!content) {
        throw new ApiError(400, "Empty or null fields are invalid");
    }
    const updateComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user._id
        },
        {
            $set: {
                content,
            },
        },
        { new: true } //return the updated comment instead of the old one
    )
    if (!updateComment) {
        throw new ApiError(500, "Something went wrong while updating the comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updateComment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment Id");
    }
    if (!req.user) {
        throw new ApiError(401, "No user found")
    }

    const deleteComment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id,
    })
    if (!deleteComment) {
        throw new ApiError(500, "Something went wrong while deleting the comment")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, deleteComment, "Comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}