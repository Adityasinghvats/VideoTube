import mongoose, { mongo } from "mongoose";

const subscriptionSchema = new mongoose(
    {
        subscriber: {
            type: Schema.Types.ObjectId, // one who is subscribing
            ref: "User"
        },
        channel: {
            type: Schema.Types.ObjectId, // one to whom 'subscriber' is subscribing
            ref: "User"
        }
    },
    {timestamps: true}
)

export const Subscription = mongoose.model("Subscription", subscriptionSchema);