import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
    getAllTweets
} from "../controllers/tweet.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Tweet:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Tweet ID
 *         content:
 *           type: string
 *           description: Tweet content
 *         owner:
 *           type: string
 *           description: User ID of tweet owner
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Tweet creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Tweet last update timestamp
 */

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

/**
 * @openapi
 * /api/v1/tweets:
 *   post:
 *     summary: Create a new tweet
 *     description: Creates a new tweet for the authenticated user
 *     tags: [Tweets]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Tweet content
 *                 example: "This is my first tweet!"
 *     responses:
 *       201:
 *         description: Tweet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Tweet'
 *             example:
 *               statusCode: 201
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 content: "This is my first tweet!"
 *                 owner: "507f1f77bcf86cd799439012"
 *                 createdAt: "2025-10-25T10:30:00Z"
 *                 updatedAt: "2025-10-25T10:30:00Z"
 *               message: "Tweet created successfully"
 *               success: true
 *       400:
 *         description: Tweet cannot be empty
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: User not found or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Something went wrong creating tweet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   get:
 *     summary: Get all tweets
 *     description: Retrieves all tweets sorted by creation date (newest first)
 *     tags: [Tweets]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All tweets fetched successfully
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
 *                         $ref: '#/components/schemas/Tweet'
 *             example:
 *               statusCode: 200
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   content: "Latest tweet"
 *                   owner: "507f1f77bcf86cd799439012"
 *                   createdAt: "2025-10-25T10:30:00Z"
 *                   updatedAt: "2025-10-25T10:30:00Z"
 *                 - _id: "507f1f77bcf86cd799439013"
 *                   content: "Older tweet"
 *                   owner: "507f1f77bcf86cd799439014"
 *                   createdAt: "2025-10-24T09:15:00Z"
 *                   updatedAt: "2025-10-24T09:15:00Z"
 *               message: "All tweets fetched successfully"
 *               success: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.route("/").post(createTweet).get(getAllTweets);

/**
 * @openapi
 * /api/v1/tweets/user/{userId}:
 *   get:
 *     summary: Get user tweets
 *     description: Retrieves all tweets from a specific user sorted by creation date (newest first)
 *     tags: [Tweets]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to fetch tweets from
 *     responses:
 *       200:
 *         description: User tweets fetched successfully
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
 *                         $ref: '#/components/schemas/Tweet'
 *             example:
 *               statusCode: 200
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   content: "User's latest tweet"
 *                   owner: "507f1f77bcf86cd799439012"
 *                   createdAt: "2025-10-25T10:30:00Z"
 *                   updatedAt: "2025-10-25T10:30:00Z"
 *               message: "User tweets fetched successfully"
 *               success: true
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Tweets not found
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
router.route("/user/:userId").get(getUserTweets);

/**
 * @openapi
 * /api/v1/tweets/{tweetId}:
 *   patch:
 *     summary: Update tweet
 *     description: Updates tweet content (only owner can update)
 *     tags: [Tweets]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tweetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tweet ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated tweet content
 *                 example: "Updated tweet content"
 *     responses:
 *       200:
 *         description: Tweet updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Tweet'
 *             example:
 *               statusCode: 200
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 content: "Updated tweet content"
 *                 owner: "507f1f77bcf86cd799439012"
 *                 createdAt: "2025-10-25T10:30:00Z"
 *                 updatedAt: "2025-10-25T11:00:00Z"
 *               message: "Tweet updated successfully"
 *               success: true
 *       400:
 *         description: Invalid tweet ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Tweets cannot be accessed - Not the owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Tweet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Something went wrong updating tweet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   delete:
 *     summary: Delete tweet
 *     description: Deletes a tweet (only owner can delete)
 *     tags: [Tweets]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tweetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tweet ID to delete
 *     responses:
 *       200:
 *         description: Tweet deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Tweet'
 *             example:
 *               statusCode: 200
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 content: "Deleted tweet content"
 *                 owner: "507f1f77bcf86cd799439012"
 *                 createdAt: "2025-10-25T10:30:00Z"
 *                 updatedAt: "2025-10-25T10:30:00Z"
 *               message: "Tweet deleted successfully"
 *               success: true
 *       400:
 *         description: Invalid tweet ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Tweets cannot be accessed - Not the owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Tweet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Something went wrong while deleting
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router