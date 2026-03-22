import mongoose, { Types } from "mongoose";

const appSchema = new mongoose.Schema({
    appOf: {
        type: Schema.Types.ObjectId,
        useRef: "Deployment"
    }
});

export default mongoose.model("App", appSchema);