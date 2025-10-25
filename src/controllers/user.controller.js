import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import { logger } from "../logger.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(500, "User not found while trying to genrate access and refresh token")
        }

        //using the user genrate access and refresh
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        //save the user in db along with refresh token
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        logger.error("Failed to generate access and refresh token", error);

        throw new ApiError(500, "Failed to generate access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body

    //validate all fields are present by triming and checking size
    //other options are zod
    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    //check if user already exists in mongodb using or operator
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    //req files from multer
    console.warn(req.files)
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //refactor
    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
        logger.info("Uploaded avatar")
    } catch (error) {
        logger.error("Error uploading avatar", error);
        throw new ApiError(500, "Failed to upload avatar")
    }

    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverLocalPath)
        logger.info("Uploaded coverImage")
    } catch (error) {
        logger.error("Error uploading coverImage", error);
        throw new ApiError(500, "Failed to upload coverImage")
    }

    try {
        const user = await User.create({
            username: username.toLowerCase(),
            email,
            fullname,
            avatar: avatar.url,
            coverimage: coverImage?.url || "",
            password
        })

        //returns back every field even password so twe need to de select somethings
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
        if (!createdUser) {
            throw new ApiError(500, "User not created while registering a user")
        }

        return res
            .status(201)
            .json(new ApiResponse(201, createdUser, "User registered successfully"))
    } catch (error) {
        logger.error("user creation failed", error);
        if (avatar) {
            await deleteFromCloudinary(avatar.public_id)
        }
        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id)
        }
        throw new ApiError(500, "User not created while registering a user and images where deleted")
    }
})

const loginUser = asyncHandler(async (req, res) => {
    //get data from body
    const { username, email, password } = req.body
    if (!email || !password) {
        throw new ApiError(400, "Email and password is required");
    }
    //check for user
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(409, "User with email or username not found")
    }

    //validate password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(409, "Invalid user credentials");
    }

    //generate and get hold of them
    const { accessToken, refreshToken } = await
        generateAccessAndRefreshToken(user._id);

    //get user from db
    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")
    if (!loggedInUser) {
        throw new ApiError(409, "Logged in user not found in DB");
    }

    //options to send logged in details to user
    //httponly true makes cookies non modifiable by client side
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }

    //send all of this data
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            { user: loggedInUser, accessToken: accessToken },
            "User logged in successfully"
        ))
    //in case your want to use for mobile devices , they cannot access cookies
})

const logoutUser = asyncHandler(async (req, res) => {
    //delete refresh token from DB
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        { new: true }
    )
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "User logged out successfully"))
})

//for new set of refresh tokens after hitting 401 , smjho in notes
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken ||
        req.body.refreshToken //for web || mobile
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    try {
        //check refresh token
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        )
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
        //validation
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid refresh token")
        }

        //generate and send
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        }

        const { accessToken, refreshToken: newRefreshToken } =
            await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(
                200,
                { accessToken, refreshToken: newRefreshToken },
                "User logged in successfully"
            ));

    } catch (error) {
        throw new ApiError(500,
            "Something went wrong while refreshing access token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordValid) {
        throw new ApiError(401, "Old password is incorrect")
    }
    //dont think it is not encypted, we have encypted it in user.modek using prehook
    user.password = newPassword

    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user details"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body

    if (!fullname || !email) {
        throw new ApiError(400, "Fullname and email are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullname,
                email: email,
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200, "Details updated successfully", user))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Something went wrong while uploading new image")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponse(200, "Avatar image updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverLocalPath = req.file?.path
    if (!coverLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const coverimage = await uploadOnCloudinary(coverLocalPath)

    if (!coverimage.url) {
        throw new ApiError(400, "Something went wrong while uploading cover image")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverimage: coverimage.url
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponse(200, "Coverimage image updated successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username?.trim()) {
        throw new ApiError(400, "Username not found");
    }

    const channel = await User.aggregate(
        [
            {
                $match: {
                    username: username?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscriberCount: {
                        $size: "$subscribers"
                    },
                    channelSubscribeToCount: {
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            if: {
                                $in: [req.user?._id, "$subscribers.subscriber"]
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                //project only necessary data
                $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                    subscriberCount: 1,
                    channelSubscribeToCount: 1,
                    isSubscribed: 1,
                    coverimage: 1,
                    email: 1
                }
            }
        ]
    )

    if (!channel?.length) {
        throw new ApiError(400, "Channel not found");
    }

    return res.status(200).json(
        new ApiResponse(200, channel[0], "Channel profile fetched successfully")
    )

})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate(
        [
            { $match: { _id: new mongoose.Types.ObjectId(req.user?._id) } },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullname: 1,
                                            username: 1,
                                            avatar: 1,
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                owner: {
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                }
            }
        ]
    )

    if (!user?.length) {
        throw new ApiError(400, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user[0]?.watchHistory, "History data fetched successfully")
    )
})

export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}