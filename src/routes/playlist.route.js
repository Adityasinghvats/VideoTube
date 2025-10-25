import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Playlist:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Playlist ID
 *         name:
 *           type: string
 *           description: Playlist name
 *         description:
 *           type: string
 *           description: Playlist description
 *         videos:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of video IDs in the playlist
 *         owner:
 *           type: string
 *           description: User ID of playlist owner
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PlaylistDetail:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         videos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VideoDetail'
 *           description: Array of populated video objects
 *         owner:
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
 * /api/v1/playlist:
 *   post:
 *     summary: Create a new playlist
 *     description: Creates a new playlist for the authenticated user
 *     tags: [Playlists]
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
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Playlist name
 *                 example: "My Favorite Videos"
 *               description:
 *                 type: string
 *                 description: Playlist description
 *                 example: "A collection of my favorite tutorials"
 *     responses:
 *       201:
 *         description: Playlist created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Playlist'
 *             example:
 *               statusCode: 201
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "My Favorite Videos"
 *                 description: "A collection of my favorite tutorials"
 *                 videos: []
 *                 owner: "507f1f77bcf86cd799439012"
 *                 createdAt: "2025-10-25T10:30:00Z"
 *                 updatedAt: "2025-10-25T10:30:00Z"
 *               message: "Playlist created successfully"
 *               success: true
 *       400:
 *         description: Name and description are required
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
 *       500:
 *         description: Failed to create playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.route("/").post(createPlaylist)

/**
 * @openapi
 * /api/v1/playlist/{playlistId}:
 *   get:
 *     summary: Get playlist by ID
 *     description: Retrieves a specific playlist with populated video details
 *     tags: [Playlists]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *         description: Playlist ID
 *     responses:
 *       200:
 *         description: Playlist retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PlaylistDetail'
 *             example:
 *               statusCode: 200
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "My Favorite Videos"
 *                 description: "A collection of my favorite tutorials"
 *                 videos:
 *                   - _id: "507f1f77bcf86cd799439013"
 *                     title: "JavaScript Tutorial"
 *                     thumbnail: "https://cloudinary.com/thumb.jpg"
 *                 owner: "507f1f77bcf86cd799439012"
 *                 createdAt: "2025-10-25T10:30:00Z"
 *                 updatedAt: "2025-10-25T10:30:00Z"
 *               message: "Playlist retrieved successfully"
 *               success: true
 *       400:
 *         description: Invalid playlist ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Playlist not found
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
 *     summary: Update playlist
 *     description: Updates playlist name and description (only owner can update)
 *     tags: [Playlists]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *         description: Playlist ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated playlist name
 *                 example: "Updated Playlist Name"
 *               description:
 *                 type: string
 *                 description: Updated playlist description
 *                 example: "Updated description"
 *     responses:
 *       200:
 *         description: Playlist updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Playlist'
 *             example:
 *               statusCode: 200
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Updated Playlist Name"
 *                 description: "Updated description"
 *                 videos: ["507f1f77bcf86cd799439013"]
 *                 owner: "507f1f77bcf86cd799439012"
 *                 createdAt: "2025-10-25T10:30:00Z"
 *                 updatedAt: "2025-10-25T11:00:00Z"
 *               message: "Playlist updated successfully"
 *               success: true
 *       400:
 *         description: Invalid playlist ID or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: You are not authorized to modify this playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Playlist not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Failed to update playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   delete:
 *     summary: Delete playlist
 *     description: Deletes a playlist (only owner can delete)
 *     tags: [Playlists]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *         description: Playlist ID to delete
 *     responses:
 *       200:
 *         description: Playlist deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Playlist'
 *             example:
 *               statusCode: 200
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Deleted Playlist"
 *                 description: "This playlist was deleted"
 *                 videos: []
 *                 owner: "507f1f77bcf86cd799439012"
 *                 createdAt: "2025-10-25T10:30:00Z"
 *                 updatedAt: "2025-10-25T10:30:00Z"
 *               message: "Playlist deleted successfully"
 *               success: true
 *       400:
 *         description: Invalid playlist ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: You are not authorized to modify this playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Playlist not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Failed to delete playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

/**
 * @openapi
 * /api/v1/playlist/add/{videoId}/{playlistId}:
 *   patch:
 *     summary: Add video to playlist
 *     description: Adds a video to a playlist (only owner can modify)
 *     tags: [Playlists]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID to add
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *         description: Playlist ID to add video to
 *     responses:
 *       200:
 *         description: Video added to playlist successfully
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
 *                         type: object
 *             example:
 *               statusCode: 200
 *               data: []
 *               message: "Video added to playlist successfully"
 *               success: true
 *       400:
 *         description: Invalid playlist ID or video ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: You are not authorized to modify this playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Playlist not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Failed to add video to playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);

/**
 * @openapi
 * /api/v1/playlist/remove/{videoId}/{playlistId}:
 *   patch:
 *     summary: Remove video from playlist
 *     description: Removes a video from a playlist (only owner can modify)
 *     tags: [Playlists]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID to remove
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *         description: Playlist ID to remove video from
 *     responses:
 *       200:
 *         description: Video removed from playlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Playlist'
 *             example:
 *               statusCode: 200
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "My Playlist"
 *                 description: "My playlist description"
 *                 videos: []
 *                 owner: "507f1f77bcf86cd799439012"
 *                 createdAt: "2025-10-25T10:30:00Z"
 *                 updatedAt: "2025-10-25T11:00:00Z"
 *               message: "Video removed from playlist successfully"
 *               success: true
 *       400:
 *         description: Invalid playlist ID or video ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: You are not authorized to modify this playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Playlist not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Failed to remove video from playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

/**
 * @openapi
 * /api/v1/playlist/user/{userId}:
 *   get:
 *     summary: Get user playlists
 *     description: Retrieves all playlists created by a specific user
 *     tags: [Playlists]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to fetch playlists for
 *     responses:
 *       200:
 *         description: User playlists retrieved successfully
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
 *                         $ref: '#/components/schemas/Playlist'
 *             example:
 *               statusCode: 200
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   name: "Favorites"
 *                   description: "My favorite videos"
 *                   videos: ["507f1f77bcf86cd799439013"]
 *                   owner: "507f1f77bcf86cd799439012"
 *                   createdAt: "2025-10-25T10:30:00Z"
 *                   updatedAt: "2025-10-25T10:30:00Z"
 *                 - _id: "507f1f77bcf86cd799439014"
 *                   name: "Watch Later"
 *                   description: "Videos to watch later"
 *                   videos: []
 *                   owner: "507f1f77bcf86cd799439012"
 *                   createdAt: "2025-10-24T09:15:00Z"
 *                   updatedAt: "2025-10-24T09:15:00Z"
 *               message: "User playlists retrieved successfully"
 *               success: true
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: No playlists found
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
router.route("/user/:userId").get(getUserPlaylists);

export default router