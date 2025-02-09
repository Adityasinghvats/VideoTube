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
app.use(express.json({limit:"16kb"}));
// allow data in url encoded format 
app.use(express.urlencoded({extended: true, limit:"16kb"}))
// serving assets like images , css
app.use(express.static("public"))
app.use(cookieParser())

// import Routes
import healthcheckRouter from "./routes/healthcheck.route.js";
import userRouter from "./routes/user.route.js";
import { errorHandler } from "./middlewares/error.middlewares.js";

// routes
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users",userRouter);

app.use(errorHandler)

export {app }