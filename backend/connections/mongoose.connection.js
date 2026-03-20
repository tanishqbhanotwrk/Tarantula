import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGOURI);
        console.log("MongoDB connected");
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};