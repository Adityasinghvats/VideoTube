import { app } from "./app.js";
import dotenv from "dotenv";
import connectdb from "./db/index.js";
import { createTweetIndex, createVideoIndex } from "./utils/elasticUtility.js";

// necessary to work with env port
dotenv.config({
    path: './.env'
})

const port = process.env.PORT || 4000

connectdb()
    .then(() => {
        app.listen(port, () => {
            console.log(`App running a port :${port}`);
        })
        // createTweetIndex()
        // createVideoIndex()
    })
    .catch((err) => {
        console.log("Mongodb connection error", err);
    })