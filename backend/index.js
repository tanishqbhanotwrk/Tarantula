import express from "express";
import dotenv from "dotenv";

dotenv.config();

import deploymentRoutes from "./routes/deployment.routes.js"
import { connectDB } from "./connections/mongoose.connection.js";
import {redis} from "./connections/redis.connection.js"

const PORT = process.env.PORT || 8080;

const app = express();
connectDB(); 

app.use(express.json());

app.use("/api/deployment", deploymentRoutes);

app.get("/", (req, res) => {
    return res.json("Hello from the server pookie.....!");
});

app.listen(PORT, () => {
    console.log("Server is running....");
});