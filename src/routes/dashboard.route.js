import { Router } from 'express';
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     ChannelStats:
 *       type: object
 *       properties:
 *         totalVideos:
 *           type: number
 *           description: Total number of videos uploaded by the channel
 *         totalViews:
 *           type: number
 *           description: Total views across all videos
 *         totalSubscriptions:
 *           type: number
 *           description: Total number of subscribers
 *         totalLikes:
 *           type: number
 *           description: Total likes on videos, comments, and tweets
 *     VideoItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         videoFile:
 *           type: string
 *           description: Video file URL
 *         thumbnail:
 *           type: string
 *           description: Video thumbnail URL
 *         title:
 *           type: string
 *           description: Video title
 *         description:
 *           type: string
 *           description: Video description
 *         duration:
 *           type: number
 *           description: Video duration in seconds
 *         views:
 *           type: number
 *           description: Number of views
 *         isPublished:
 *           type: boolean
 *           description: Publication status
 */

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

/**
 * @openapi
 * /api/v1/dashboard/stats:
 *   get:
 *     summary: Get channel statistics
 *     description: Retrieves comprehensive statistics for the authenticated user's channel including total videos, views, subscribers, and likes
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ChannelStats'
 *             example:
 *               statusCode: 200
 *               data:
 *                 totalVideos: 15
 *                 totalViews: 50000
 *                 totalSubscriptions: 1200
 *                 totalLikes: 3500
 *               message: "Stats fetched successfully"
 *               success: true
 *       401:
 *         description: Unauthorized - User not found or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.route("/stats").get(getChannelStats);

/**
 * @openapi
 * /api/v1/dashboard/videos:
 *   get:
 *     summary: Get channel videos
 *     description: Retrieves paginated list of videos for the authenticated user's channel with optional search and sorting
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of videos per page
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query to filter videos by title (case-insensitive)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, views, duration, isPublished]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortType
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order (asc for ascending, desc for descending)
 *     responses:
 *       200:
 *         description: Videos fetched successfully
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
 *                         $ref: '#/components/schemas/VideoItem'
 *             example:
 *               statusCode: 200
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   videoFile: "https://cloudinary.com/video.mp4"
 *                   thumbnail: "https://cloudinary.com/thumbnail.jpg"
 *                   title: "My Awesome Video"
 *                   description: "This is a great video"
 *                   duration: 300
 *                   views: 1500
 *                   isPublished: true
 *               message: "Videos fetched successfully"
 *               success: true
 *       401:
 *         description: Unauthorized - User not found or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Videos not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.route("/videos").get(getChannelVideos);

export default router