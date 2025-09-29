import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { addIndexedData, updateIndexedData, deleteIndexedData } from "../utils/elasticUtility.js";

const videoSchema = new mongoose(
    {
        videoFile: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        views: {
            type: Number,
            required: 0 //default value was given as 0
        },
        duration: {
            type: Number,
            required: true
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
)

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);

Video.watch().on('change', async (change) => {
    console.log('Change detected in video model:', change);

    switch (change.operationType) {
        case 'insert':
            addIndexedData(change, 'videos');
            break;

        case 'update':
            updateIndexedData(change, 'videos');
            break;

        case 'delete':
            deleteIndexedData(change, 'videos');
            break;
    }
});
