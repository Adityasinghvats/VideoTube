import mongoose, {Schema} from "mongoose";

// mongodb will automatically add _id
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,//cloudinary url
            required: true
        },
        coverimage: {
            type: String,//cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password:{
            type: String,
            required: [true, "Password is required"] //error when password is not provided is also provided
        },
        refreshToken: {
            type: String
        }
    },
    {timestamps: true}
)

export const User = mongoose.model("User", userSchema); //asking  mongoose to create a collection with 
                                                        // name user and schema userSchema