import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Subscription:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Subscription ID
 *         subscriber:
 *           type: string
 *           description: User ID of the subscriber
 *         channel:
 *           type: string
 *           description: User ID of the channel being subscribed to
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SubscriptionWithSubscriber:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         subscriber:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         channel:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SubscriptionWithChannel:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         subscriber:
 *           type: string
 *         channel:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
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
 * /api/v1/subscriptions/c/{channelId}:
 *   post:
 *     summary: Toggle subscription
 *     description: Subscribes to a channel if not already subscribed, unsubscribes if already subscribed
 *     tags: [Subscriptions]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Channel (User) ID to subscribe/unsubscribe to
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               statusCode: 200
 *               data: {}
 *               message: "Unsubscribed successfully"
 *               success: true
 *       201:
 *         description: Subscribed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Subscription'
 *             example:
 *               statusCode: 201
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 subscriber: "507f1f77bcf86cd799439012"
 *                 channel: "507f1f77bcf86cd799439013"
 *                 createdAt: "2025-10-25T10:30:00Z"
 *                 updatedAt: "2025-10-25T10:30:00Z"
 *               message: "Subscribed successfully"
 *               success: true
 *       400:
 *         description: Invalid channel ID or attempting to subscribe to yourself
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               invalidId:
 *                 value:
 *                   statusCode: 400
 *                   message: "Invalid channelId"
 *                   success: false
 *                   errors: []
 *               selfSubscribe:
 *                 value:
 *                   statusCode: 400
 *                   message: "You cannot subscribe to yourself"
 *                   success: false
 *                   errors: []
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router
    .route("/c/:channelId")
    .post(toggleSubscription);

/**
 * @openapi
 * /api/v1/subscriptions/c:
 *   get:
 *     summary: Get subscribed channels
 *     description: Retrieves list of all channels the authenticated user has subscribed to
 *     tags: [Subscriptions]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscribed channels fetched successfully
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
 *                         $ref: '#/components/schemas/SubscriptionWithChannel'
 *             example:
 *               statusCode: 200
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   subscriber: "507f1f77bcf86cd799439012"
 *                   channel:
 *                     _id: "507f1f77bcf86cd799439013"
 *                     name: "Tech Channel"
 *                     email: "tech@example.com"
 *                   createdAt: "2025-10-25T10:30:00Z"
 *                   updatedAt: "2025-10-25T10:30:00Z"
 *                 - _id: "507f1f77bcf86cd799439014"
 *                   subscriber: "507f1f77bcf86cd799439012"
 *                   channel:
 *                     _id: "507f1f77bcf86cd799439015"
 *                     name: "Gaming Channel"
 *                     email: "gaming@example.com"
 *                   createdAt: "2025-10-24T09:15:00Z"
 *                   updatedAt: "2025-10-24T09:15:00Z"
 *               message: "Subscribed channels fetched successfully"
 *               success: true
 *       400:
 *         description: Invalid subscriber ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: No channels found for this user
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
router.route("/c").get(getSubscribedChannels);

/**
 * @openapi
 * /api/v1/subscriptions/u:
 *   get:
 *     summary: Get channel subscribers
 *     description: Retrieves list of all subscribers to the authenticated user's channel
 *     tags: [Subscriptions]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscribers fetched successfully
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
 *                         $ref: '#/components/schemas/SubscriptionWithSubscriber'
 *             example:
 *               statusCode: 200
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   subscriber:
 *                     _id: "507f1f77bcf86cd799439012"
 *                     name: "John Doe"
 *                     email: "john@example.com"
 *                   channel: "507f1f77bcf86cd799439013"
 *                   createdAt: "2025-10-25T10:30:00Z"
 *                   updatedAt: "2025-10-25T10:30:00Z"
 *                 - _id: "507f1f77bcf86cd799439014"
 *                   subscriber:
 *                     _id: "507f1f77bcf86cd799439015"
 *                     name: "Jane Smith"
 *                     email: "jane@example.com"
 *                   channel: "507f1f77bcf86cd799439013"
 *                   createdAt: "2025-10-24T09:15:00Z"
 *                   updatedAt: "2025-10-24T09:15:00Z"
 *               message: "Subscribers fetched successfully"
 *               success: true
 *       400:
 *         description: Invalid channel ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: No subscribers found for this channel
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
router.route("/u").get(getUserChannelSubscribers);

export default router