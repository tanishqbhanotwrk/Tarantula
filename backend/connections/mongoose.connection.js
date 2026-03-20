import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) return;
        await mongoose.connect(process.env.MONGOURI);
        console.log("MongoDB connected");
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};