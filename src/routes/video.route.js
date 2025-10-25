import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { upload } from "../middlewares/multer.middlewares.js"

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     VideoOwner:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         username:
 *           type: string
 *         fullname:
 *           type: string
 *         avatar:
 *           type: string
 *     VideoDetail:
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
 *         owner:
 *           $ref: '#/components/schemas/VideoOwner'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/v1/videos:
 *   get:
 *     summary: Get all videos
 *     description: Retrieves paginated list of all videos with optional search and sorting
 *     tags: [Videos]
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
 *         description: Sort order
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
 *                         $ref: '#/components/schemas/VideoDetail'
 *       401:
 *         description: Unauthorized - User not found
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
 *   post:
 *     summary: Publish a new video
 *     description: Uploads and publishes a new video with thumbnail
 *     tags: [Videos]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - videoFile
 *               - thumbnail
 *               - title
 *               - description
 *             properties:
 *               videoFile:
 *                 type: string
 *                 format: binary
 *                 description: Video file to upload
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Thumbnail image for the video
 *               title:
 *                 type: string
 *                 description: Video title
 *               description:
 *                 type: string
 *                 description: Video description
 *     responses:
 *       201:
 *         description: Video uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/VideoDetail'
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error uploading video
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router
    .route("/")
    .get(verifyJWT, getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },

        ]),
        verifyJWT,
        publishVideo
    );

/**
 * @openapi
 * /api/v1/videos/{videoId}:
 *   get:
 *     summary: Get video by ID
 *     description: Retrieves a specific video by its ID with owner details
 *     tags: [Videos]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/VideoDetail'
 *             example:
 *               statusCode: 200
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 videoFile: "https://cloudinary.com/video.mp4"
 *                 thumbnail: "https://cloudinary.com/thumb.jpg"
 *                 title: "JavaScript Tutorial"
 *                 description: "Learn JavaScript from scratch"
 *                 duration: 3600
 *                 views: 1500
 *                 isPublished: true
 *                 owner:
 *                   _id: "507f1f77bcf86cd799439012"
 *                   name: "John Doe"
 *                   email: "john@example.com"
 *                 createdAt: "2025-10-25T10:30:00Z"
 *                 updatedAt: "2025-10-25T10:30:00Z"
 *               message: "Video fetched successfully"
 *               success: true
 *       400:
 *         description: Invalid video ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Video not found
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
 *   patch:
 *     summary: Update video
 *     description: Updates video details (title, description, and/or thumbnail). Only owner can update.
 *     tags: [Videos]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Updated video title
 *                 example: "Updated JavaScript Tutorial"
 *               description:
 *                 type: string
 *                 description: Updated video description
 *                 example: "Updated description for the tutorial"
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Updated thumbnail image (optional)
 *     responses:
 *       200:
 *         description: Video updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/VideoDetail'
 *             example:
 *               statusCode: 200
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 videoFile: "https://cloudinary.com/video.mp4"
 *                 thumbnail: "https://cloudinary.com/new-thumb.jpg"
 *                 title: "Updated JavaScript Tutorial"
 *                 description: "Updated description for the tutorial"
 *                 duration: 3600
 *                 views: 1500
 *                 isPublished: true
 *                 owner: "507f1f77bcf86cd799439012"
 *                 createdAt: "2025-10-25T10:30:00Z"
 *                 updatedAt: "2025-10-25T11:00:00Z"
 *               message: "Video updated successfully"
 *               success: true
 *       400:
 *         description: Invalid video ID or missing thumbnail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Video not found
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
 *   delete:
 *     summary: Delete video
 *     description: Deletes a video. Only the owner can delete their video.
 *     tags: [Videos]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/VideoDetail'
 *             example:
 *               statusCode: 200
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 videoFile: "https://cloudinary.com/video.mp4"
 *                 thumbnail: "https://cloudinary.com/thumb.jpg"
 *                 title: "JavaScript Tutorial"
 *                 description: "Learn JavaScript from scratch"
 *                 duration: 3600
 *                 views: 1500
 *                 isPublished: true
 *                 owner: "507f1f77bcf86cd799439012"
 *                 createdAt: "2025-10-25T10:30:00Z"
 *                 updatedAt: "2025-10-25T10:30:00Z"
 *               message: "Video deleted successfully"
 *               success: true
 *       400:
 *         description: Invalid video ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Video not found
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
router
    .route("/:videoId")
    .get(verifyJWT, getVideoById)
    .delete(verifyJWT, deleteVideo)
    .patch(upload.single("thumbnail"), verifyJWT, updateVideo);

/**
 * @openapi
 * /api/v1/videos/toggle/publish/{videoId}:
 *   patch:
 *     summary: Toggle video publish status
 *     description: Toggles the publish status of a video (only owner can toggle)
 *     tags: [Videos]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video publish status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/VideoDetail'
 *       400:
 *         description: Invalid video ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Not authorized to perform this action
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Video not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);

export default router