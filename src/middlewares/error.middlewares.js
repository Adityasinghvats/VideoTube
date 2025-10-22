import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../logger.js";

const errorHandler = (err, req, res, next) => {
    let error = err
    if (!(error instanceof ApiError)) {
        //manipulating error code and message from ApiError
        const statusCode = error.statusCode || error instanceof mongoose.Error ? 400 : 500;

        const message = error.message || "Something went wrong"

        error = new ApiError(statusCode, message, error?.errors || [], err.stack)
    }
    logger.error(`Error occurred: ${error.message}`, { stack: error.stack, errors: error.errors });

    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
    }

    return res.status(error.statusCode).json(response)
}

export { errorHandler }