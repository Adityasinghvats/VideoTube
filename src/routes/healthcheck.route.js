import { Router } from "express";
import { healthcheck } from "../controllers/healthcheck.controller.js";

const router = Router();
/**
 * @openapi
 * /api/v1/healthcheck:
 *   get:
 *     summary: Healthcheck endpoint to verify API status
 *     tags: [Healthcheck]
 *     responses:
 *       200:
 *         description: API is healthy
 */
router.route("/").get(healthcheck);

export default router;