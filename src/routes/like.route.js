import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controller.js"
import { verifyJWT } from '../middlewares/auth.middlewares.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Like:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Like ID
 *         video:
 *           type: string
 *           description: Video ID (if like is on a video)
 *         comment:
 *           type: string
 *           description: Comment ID (if like is on a comment)
 *         tweet:
 *           type: string
 *           description: Tweet ID (if like is on a tweet)
 *         likedBy:
 *           type: string
 *           description: User ID who liked
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     LikedVideo:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Like ID
 *         video:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             title:
 *               type: string
 *             url:
 *               type: string
 *         likedBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

/**
 * @openapi
 * /api/v1/likes/toggle/v/{videoId}:
 *   post:
 *     summary: Toggle video like
 *     description: Likes a video if not already liked, unlikes if already liked
 *     tags: [Likes]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID to like/unlike
 *     responses:
 *       200:
 *         description: Video unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               statusCode: 200
 *               data: {}
 *               message: "Video unliked successfully"
 *               success: true
 *       201:
 *         description: Video liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Like'
 *             example:
 *               statusCode: 201
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 video: "507f1f77bcf86cd799439012"
 *                 likedBy: "507f1f77bcf86cd799439013"
 *                 createdAt: "2025-10-25T10:30:00Z"
 *                 updatedAt: "2025-10-25T10:30:00Z"
 *               message: "Video liked successfully"
 *               success: true
 *       400:
 *         description: Invalid video ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.route("/toggle/v/:videoId").post(toggleVideoLike);

/**
 * @openapi
 * /api/v1/likes/toggle/c/{commentId}:
 *   post:
 *     summary: Toggle comment like
 *     description: Likes a comment if not already liked, unlikes if already liked
 *     tags: [Likes]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID to like/unlike
 *     responses:
 *       200:
 *         description: Comment unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               statusCode: 200
 *               data: {}
 *               message: "Comment unliked successfully"
 *               success: true
 *       201:
 *         description: Comment liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Like'
 *             example:
 *               statusCode: 201
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 comment: "507f1f77bcf86cd799439012"
 *                 likedBy: "507f1f77bcf86cd799439013"
 *                 createdAt: "2025-10-25T10:30:00Z"
 *                 updatedAt: "2025-10-25T10:30:00Z"
 *               message: "Comment liked successfully"
 *               success: true
 *       400:
 *         description: Invalid comment ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.route("/toggle/c/:commentId").post(toggleCommentLike);

/**
 * @openapi
 * /api/v1/likes/toggle/t/{tweetId}:
 *   post:
 *     summary: Toggle tweet like
 *     description: Likes a tweet if not already liked, unlikes if already liked
 *     tags: [Likes]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tweetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tweet ID to like/unlike
 *     responses:
 *       200:
 *         description: Tweet unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               statusCode: 200
 *               data: {}
 *               message: "Tweet unliked successfully"
 *               success: true
 *       201:
 *         description: Tweet liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Like'
 *             example:
 *               statusCode: 201
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 tweet: "507f1f77bcf86cd799439012"
 *                 likedBy: "507f1f77bcf86cd799439013"
 *                 createdAt: "2025-10-25T10:30:00Z"
 *                 updatedAt: "2025-10-25T10:30:00Z"
 *               message: "Tweet liked successfully"
 *               success: true
 *       400:
 *         description: Invalid tweet ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.route("/toggle/t/:tweetId").post(toggleTweetLike);

/**
 * @openapi
 * /api/v1/likes/videos:
 *   get:
 *     summary: Get liked videos
 *     description: Retrieves all videos liked by the authenticated user with video details
 *     tags: [Likes]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liked videos fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LikedVideo'
 *             example:
 *               statusCode: 200
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   video:
 *                     _id: "507f1f77bcf86cd799439012"
 *                     title: "Amazing Video Tutorial"
 *                     url: "https://cloudinary.com/video.mp4"
 *                   likedBy: "507f1f77bcf86cd799439013"
 *                   createdAt: "2025-10-25T10:30:00Z"
 *                   updatedAt: "2025-10-25T10:30:00Z"
 *                 - _id: "507f1f77bcf86cd799439014"
 *                   video:
 *                     _id: "507f1f77bcf86cd799439015"
 *                     title: "Another Great Video"
 *                     url: "https://cloudinary.com/video2.mp4"
 *                   likedBy: "507f1f77bcf86cd799439013"
 *                   createdAt: "2025-10-24T09:15:00Z"
 *                   updatedAt: "2025-10-24T09:15:00Z"
 *               message: "Liked videos fetched successfully"
 *               success: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.route("/videos").get(getLikedVideos);

export default router