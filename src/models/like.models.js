import mongoose, { mongo } from "mongoose";

const likeSchema = new mongoose(
    {

    },
    {timestamps: true}
)

export const Like = mongoose.model("Like", likeSchema);