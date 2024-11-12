import mongoose, { mongo } from "mongoose";

const tweetSchema = new mongoose(
    {
        content: {
            type: String,
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {timestamps: true}
)

export const Tweet = mongoose.model("Tweet", tweetSchema);