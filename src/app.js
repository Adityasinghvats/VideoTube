import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { swaggerSpec } from "./utils/swagger.js";
import swaggerUi from "swagger-ui-express";

const app = express()

// using cors pre-cooked middleware
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
)
// all json data is allowed to come in limit 
app.use(express.json({ limit: "16kb" }));
// allow data in url encoded format 
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
// serving assets like images , css
app.use(express.static("public"))
app.use(cookieParser())

app.get('/api-docs.json', (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const spec = { ...swaggerSpec, servers: [{ url: baseUrl }] };
    res.setHeader('Content-Type', 'application/json');
    res.send(spec);
});

// add flag or auth for api-docs endpoint in production
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(undefined, {
    swaggerOptions: { url: '/api-docs.json' }
}));

// import Routes
import healthcheckRouter from "./routes/healthcheck.route.js";
import userRouter from "./routes/user.route.js";
// import searchRouter from "./routes/search.route.js";
import videoRouter from "./routes/video.route.js";
import commentRouter from "./routes/comment.route.js";
import playlistRouter from "./routes/playlist.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import likeRouter from "./routes/like.route.js";
import tweetRouter from "./routes/tweet.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
// import notificationRouter from "./routes/notification.route.js";
import { errorHandler } from "./middlewares/error.middlewares.js";

// routes
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
// app.use("/api/v1/search", searchRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/dashboard", dashboardRouter);
// app.use("/api/v1/notifications", notificationRouter);

app.use(errorHandler)

export { app }