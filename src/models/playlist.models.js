import mongoose, { mongo } from "mongoose";

const playlistSchema = new mongoose(
    {

    },
    {timestamps: true}
)

export const Playlist = mongoose.model("Playlist", playlistSchema);