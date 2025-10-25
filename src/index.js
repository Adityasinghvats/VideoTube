import './instrumentation.mjs';
import { app } from "./app.js";
import dotenv from "dotenv";
import connectdb from "./db/index.js";
import { createTweetIndex, createVideoIndex } from "./utils/elasticUtility.js";
import { logger } from "./logger.js";

// necessary to work with env port
dotenv.config({
    path: './.env'
})

const port = process.env.PORT || 4000

connectdb()
    .then(() => {
        app.listen(port, () => {
            logger.info(`App running a port :${port}`);
        })
        createTweetIndex()
        createVideoIndex()
    })
    .catch((err) => {
        logger.error("Mongodb connection error", err);
    })