import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { addIndexedData, updateIndexedData, deleteIndexedData } from "../utils/elasticUtility.js";

const videoSchema = new Schema(
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
            required: true,
            default: 0
        },
        duration: {
            type: Number,
            required: true,
            default: 0
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

const changeStream = Video.watch([], { fullDocument: 'updateLookup' });
changeStream.on('change', async (change) => {
    logger.info('Change detected in video model', { operationType: change.operationType, documentKey: change.documentKey });

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
