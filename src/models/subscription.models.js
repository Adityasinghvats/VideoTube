import mongoose, { mongo } from "mongoose";

const subscriptionSchema = new mongoose(
    {

    },
    {timestamps: true}
)

export const Subscription = mongoose.model("Subscription", subscriptionSchema);