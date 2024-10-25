import mongoose, { mongo } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose(
    {

    },
    {timestamps: true}
)
commentSchema.plugin(mongooseAggregatePaginate) //add aggregation

export const Comment = mongoose.model("Comment", commentSchema);