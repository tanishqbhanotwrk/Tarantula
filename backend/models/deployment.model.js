import mongoose from "mongoose";

const deploymentSchema = new mongoose.Schema({
    repoName: {
        type: String,
        required: true
    },
    
    repoUrl: {
        type: String,
        required: true
    },
     
    status: {
        type: String,
        enum: ["initialised", "queued", "cloning", "cloned", "building", "built", "running", "paused", "failed"],
        default: "initialised"
    },

    projectPath: {
        type: String,
    },

    apps: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "App"
        }
    ],

    logs: [
        {
            message: String,
            timestamp: Date
        }
    ]
}, {timestamps: true});

export default mongoose.model("Deployment", deploymentSchema);