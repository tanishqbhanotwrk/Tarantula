import express from "express";

import deploymentRoutes from "./routes/deployment.routes.js"

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.json());

app.use("/deployment", deploymentRoutes);

app.get("/", (req, res) => {
    return res.json("Hello from the server pookie.....!");
});

app.listen(PORT, () => {
    console.log("Server is running....");
})