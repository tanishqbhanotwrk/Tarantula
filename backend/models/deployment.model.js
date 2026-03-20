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
        enum: ["initialised", "queued", "building", "running", "failed"],
        default: "initialised"
    }
}, {timestamps: true});

export default mongoose.model("Deployment", deploymentSchema);