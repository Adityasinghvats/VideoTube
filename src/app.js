import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

// using cors pre-cooked middleware
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
)
// all json data is allowed to come in limit 
app.use(express.json({ limit: "16kb" }));
// allow data in url encoded format 
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
// serving assets like images , css
app.use(express.static("public"))
app.use(cookieParser())

// import Routes
import healthcheckRouter from "./routes/healthcheck.route.js";
import userRouter from "./routes/user.route.js";
import searchRouter from "./routes/search.route.js";
import videoRouter from "./routes/video.route.js";
import commentRouter from "./routes/comment.route.js";
import playlistRouter from "./routes/playlist.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import notificationRouter from "./routes/notification.route.js";
import { errorHandler } from "./middlewares/error.middlewares.js";

// routes
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/notifications", notificationRouter);

app.use(errorHandler)

export { app }