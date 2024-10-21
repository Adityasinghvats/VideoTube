import express from "express";
import cors from "cors";

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
app.use(express.static("[ublic"))

export {app }