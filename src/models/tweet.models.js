import mongoose, { mongo } from "mongoose";

const tweetSchema = new mongoose(
    {

    },
    {timestamps: true}
)

export const Tweet = mongoose.model("Tweet", tweetSchema);