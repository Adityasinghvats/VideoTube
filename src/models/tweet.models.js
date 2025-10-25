import mongoose, { Schema } from "mongoose";
import { addIndexedData, updateIndexedData, deleteIndexedData } from "../utils/elasticUtility.js";
import { logger } from "../logger.js";

const tweetSchema = new Schema(
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
    { timestamps: true }
)

export const Tweet = mongoose.model("Tweet", tweetSchema);


// Watch changes in MongoDB
/*
By default, change streams for update operations only include updateDescription (the changed fields), not the full document
fullDocument: 'updateLookup' tells MongoDB to fetch and include the entire updated document in the change event
 */
const changeStream = Tweet.watch([], { fullDocument: 'updateLookup' });
changeStream.on('change', async (change) => {
    logger.info('Change detected in tweet model', { operationType: change.operationType, documentKey: change.documentKey });

    switch (change.operationType) {
        case 'insert':
            addIndexedData(change, 'tweets');
            break;

        case 'update':
            updateIndexedData(change, 'tweets');
            break;

        case 'delete':
            deleteIndexedData(change, 'tweets');
            break;
    }
});
