import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    deployments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Deployment"
        }
    ]
}, {timestamps: true});

export default mongoose.model("User", userSchema);