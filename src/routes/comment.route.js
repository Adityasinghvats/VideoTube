import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     CommentOwner:
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
 *         email:
 *           type: string
 *     CommentVideo:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         thumbnail:
 *           type: string
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         content:
 *           type: string
 *           description: Comment content
 *         video:
 *           type: string
 *           description: Video ID
 *         owner:
 *           type: string
 *           description: User ID who created the comment
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CommentDetail:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         content:
 *           type: string
 *         owner:
 *           $ref: '#/components/schemas/CommentOwner'
 *         video:
 *           $ref: '#/components/schemas/CommentVideo'
 *         createdAt:
 *           type: string
 *           format: date-time
 */

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

/**
 * @openapi
 * /api/v1/comments/{videoId}:
 *   get:
 *     summary: Get video comments
 *     description: Retrieves paginated comments for a specific video with owner and video details
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID to fetch comments for
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
 *         description: Number of comments per page
 *     responses:
 *       200:
 *         description: Comments fetched successfully
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
 *                         $ref: '#/components/schemas/CommentDetail'
 *             example:
 *               statusCode: 200
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   content: "Great video! Very informative."
 *                   owner:
 *                     _id: "507f1f77bcf86cd799439012"
 *                     username: "johndoe"
 *                     fullname: "John Doe"
 *                     avatar: "https://cloudinary.com/avatar.jpg"
 *                     email: "john@example.com"
 *                   video:
 *                     _id: "507f1f77bcf86cd799439013"
 *                     title: "JavaScript Tutorial"
 *                     thumbnail: "https://cloudinary.com/thumb.jpg"
 *                   createdAt: "2025-10-25T10:30:00Z"
 *               message: "Comments fetched successfully"
 *               success: true
 *       400:
 *         description: Invalid video ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Comments not found
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
 *   post:
 *     summary: Add comment to video
 *     description: Creates a new comment on a specific video
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID to add comment to
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
 *                 description: Comment content
 *                 example: "This is a great tutorial!"
 *     responses:
 *       200:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Comment'
 *             example:
 *               statusCode: 200
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 content: "This is a great tutorial!"
 *                 video: "507f1f77bcf86cd799439012"
 *                 owner: "507f1f77bcf86cd799439013"
 *                 createdAt: "2025-10-25T10:30:00Z"
 *                 updatedAt: "2025-10-25T10:30:00Z"
 *               message: "Comment added successfully"
 *               success: true
 *       400:
 *         description: Invalid video ID or empty content
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
 *         description: Something went wrong while adding comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.route("/:videoId").get(getVideoComments).post(addComment);

/**
 * @openapi
 * /api/v1/comments/c/{commentId}:
 *   patch:
 *     summary: Update comment
 *     description: Updates comment content (only owner can update)
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID to update
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
 *                 description: Updated comment content
 *                 example: "Updated comment text"
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Comment'
 *             example:
 *               statusCode: 200
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 content: "Updated comment text"
 *                 video: "507f1f77bcf86cd799439012"
 *                 owner: "507f1f77bcf86cd799439013"
 *                 createdAt: "2025-10-25T10:30:00Z"
 *                 updatedAt: "2025-10-25T11:00:00Z"
 *               message: "Comment updated successfully"
 *               success: true
 *       400:
 *         description: Invalid comment ID or empty content
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
 *       403:
 *         description: Not allowed to update this comment - Not the owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Something went wrong while updating the comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   delete:
 *     summary: Delete comment
 *     description: Deletes a comment (only owner can delete)
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Comment'
 *             example:
 *               statusCode: 200
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 content: "Deleted comment text"
 *                 video: "507f1f77bcf86cd799439012"
 *                 owner: "507f1f77bcf86cd799439013"
 *                 createdAt: "2025-10-25T10:30:00Z"
 *                 updatedAt: "2025-10-25T10:30:00Z"
 *               message: "Comment deleted successfully"
 *               success: true
 *       400:
 *         description: Invalid comment ID
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
 *       403:
 *         description: Not allowed to delete this comment - Not the owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Something went wrong while deleting the comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router