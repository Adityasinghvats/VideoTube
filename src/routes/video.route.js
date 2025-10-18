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
 * /api/v1/videos:
 *   get:
 *     summary: Get video data
 *     tags: [Videos]
 *     responses:
 *       200:
 *         description: Video data fetched successfully
 *       500:
 *         description: Failed to fetch video data
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

router
    .route("/:videoId")
    .get(verifyJWT, getVideoById)
    .delete(verifyJWT, deleteVideo)
    .patch(upload.single("thumbnail"), verifyJWT, updateVideo);

router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);

export default router