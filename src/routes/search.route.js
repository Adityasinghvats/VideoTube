import { Router } from "express";
import { search } from "../controllers/search.controller.js";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     SearchResultSource:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *           description: Tweet content (for tweet results)
 *         title:
 *           type: string
 *           description: Video title (for video results)
 *         description:
 *           type: string
 *           description: Video description (for video results)
 *         owner:
 *           type: string
 *           description: Owner/creator ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SearchResultHighlight:
 *       type: object
 *       properties:
 *         content:
 *           type: array
 *           items:
 *             type: string
 *           description: Highlighted content snippets
 *         title:
 *           type: array
 *           items:
 *             type: string
 *           description: Highlighted title snippets
 *         description:
 *           type: array
 *           items:
 *             type: string
 *           description: Highlighted description snippets
 *     SearchResultHit:
 *       type: object
 *       properties:
 *         _index:
 *           type: string
 *           enum: [tweets, videos]
 *           description: Index name (tweets or videos)
 *         _id:
 *           type: string
 *           description: Document ID
 *         _score:
 *           type: number
 *           description: Relevance score
 *         _source:
 *           $ref: '#/components/schemas/SearchResultSource'
 *         highlight:
 *           $ref: '#/components/schemas/SearchResultHighlight'
 */

/**
 * @openapi
 * /api/v1/search/s:
 *   get:
 *     summary: Search tweets and videos
 *     description: Performs a fuzzy search across tweets and videos using Elasticsearch with multi-match and wildcard queries. Results are highlighted and ranked by relevance.
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Search query term to find matching tweets and videos
 *         example: "javascript tutorial"
 *     responses:
 *       200:
 *         description: Search results fetched successfully
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
 *                         $ref: '#/components/schemas/SearchResultHit'
 *             example:
 *               statusCode: 200
 *               data:
 *                 - _index: "videos"
 *                   _id: "507f1f77bcf86cd799439011"
 *                   _score: 5.234
 *                   _source:
 *                     title: "JavaScript Tutorial for Beginners"
 *                     description: "Learn JavaScript basics"
 *                     owner: "507f1f77bcf86cd799439012"
 *                     createdAt: "2025-01-15T10:30:00Z"
 *                   highlight:
 *                     title: ["<em>JavaScript</em> Tutorial for Beginners"]
 *                     description: ["Learn <em>JavaScript</em> basics"]
 *                 - _index: "tweets"
 *                   _id: "507f1f77bcf86cd799439013"
 *                   _score: 3.456
 *                   _source:
 *                     content: "Just published a new JavaScript tutorial!"
 *                     owner: "507f1f77bcf86cd799439014"
 *                     createdAt: "2025-01-20T14:20:00Z"
 *                   highlight:
 *                     content: ["Just published a new <em>JavaScript</em> tutorial!"]
 *               message: "Search results fetched successfully"
 *               success: true
 *       400:
 *         description: Bad request - Search query is required or no results found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               missingQuery:
 *                 value:
 *                   statusCode: 400
 *                   message: "Search query is required"
 *                   success: false
 *                   errors: []
 *               noResults:
 *                 value:
 *                   statusCode: 400
 *                   message: "Search results not found"
 *                   success: false
 *                   errors: []
 */
router.get("/s", search);

export default router;