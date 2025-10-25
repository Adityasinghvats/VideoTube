import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { logger } from "../logger.js";

const connectdb = async () => {
    try {
        const connectiondb = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        logger.info(`MongoDb connected ${connectiondb.connection.host}`);
    } catch (error) {
        logger.error("mongo db connection error", error);
        process.exit(1);
    }
}

export default connectdb;