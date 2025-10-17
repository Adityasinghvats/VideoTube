import mongoose, { Schema } from "mongoose";
import { addIndexedData, updateIndexedData, deleteIndexedData } from "../utils/elasticUtility.js";

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
// Tweet.watch().on('change', async (change) => {
//     console.log('Change detected in tweet model:', change);

//     switch (change.operationType) {
//         case 'insert':
//             addIndexedData(change, 'tweets');
//             break;

//         case 'update':
//             updateIndexedData(change, 'tweets');
//             break;

//         case 'delete':
//             deleteIndexedData(change, 'tweets');
//             break;
//     }
// });
