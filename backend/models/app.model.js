import mongoose from "mongoose";

const appSchema = new mongoose.Schema({
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

    startScript: {
        type: String
    },

    buildScript: {
        type: String
    },

    framework: {
        type: String,
    },

    isActive: {
        type: Boolean,
        default: true
    },

    port: {
        type: Number
    },

    status: {
        type: String,
        enum: ["idle", "building", "running", "failed"],
        default: "idle"
    },

    domain: {
        type: String
    },

    lastActiveAt: {
        type: Date,
        default: Date.now
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

    logs: [
        {
            message: String,
            timestamp: Date
        }
    ]
}, {timestamps: true});

appSchema.index({appOf: 1, path: 1}, {unique: true});
appSchema.index({appOf: 1, slug: 1}, {unique: true});

export default mongoose.model("App", appSchema);