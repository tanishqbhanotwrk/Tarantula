import mongoose from "mongoose";

const appSchema = new mongoose.Schema({
    //Identification
    appOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Deployment",
        required: true
    },
    
    name: {
        type: String,
        required: true
    },

    path: {
        type: String,
        required: true
    },

    slug: {
        type: String,
        required: true
    },

    hash: {
        type: String,
        required: true
    },

    //Runtime
    runtime:{
        type: String,
        enum: ["node", "python", "docker", "compose"],
        required: true
    },

    config: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    //Execution instance states
    hostPort: {
        type: Number
    },

    containerId: {
        type: String
    },

    env: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    version: {
        type: Number,
        default: 1
    },
    
    status: {
        type: String,
        enum: ["idle", "queued", "building", "deploying", "running", "failed", "stopped"],
        default: "idle"
    },

    //miscellaneous
    logCount: {
        type: Number,
        default: 0
    },

    isActive: {
        type: Boolean,
        default: true
    },

    //connection
    domain: {
        type: String
    },

    lastActiveAt: {
        type: Date,
        default: Date.now
    },

    lastDeployedAt: {
        type: Date,
    },

    lastBuildAt: {
        type: Date,
        default: Date.now
    },

    deletedAt: {
        type: Date
    },

    source: {
        type: String,
        enum: ["auto", "manual"],
        default: "auto"
    },
}, {timestamps: true});

appSchema.index({appOf: 1, path: 1}, {unique: true});
appSchema.index({appOf: 1, slug: 1}, {unique: true});
appSchema.index({ domain: 1 });
appSchema.index({ status: 1 });

export default mongoose.model("App", appSchema);