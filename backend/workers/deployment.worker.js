import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { Worker } from "bullmq";
import { redis } from "../connections/redis.connection.js";
import { connectDB } from "../connections/mongoose.connection.js";
import Deployment from "../models/deployment.model.js";

import { cloneRepo } from "../services/clone.service.js";
import { buildImage } from "../services/build.service.js";
import { detectApps } from "../services/detect.service.js";
import { generateDockerFile } from "../services/generateDockerFile.service.js";
import { extractMetaData } from "../services/metadata.service.js";
import { runContainer } from "../services/run.service.js";

await connectDB();

const getDeploymentById = async (id) => {
    try {
        const deployment = await Deployment.findById(id);
        if(!deployment){
            throw new Error("Deployment not found");
        }
        return deployment;
    } catch (error) {
        console.log(error.message);
    }
};

const checkDeploymentStatus = (deployment, status) => {
    try {
        if(status === deployment.status){
            return true
        }
        return false
    } catch (error) {
        console.log("Status does not match");
    }
};

const buildHandler = async (deployment) => {
    try {
        deployment.projectPath = await cloneRepo(deployment._id, deployment.repoUrl);
        deployment.status = "building";
        await deployment.save();
        console.log("Job building in progress: "+deployment._id);

        await new Promise((resolve) => setTimeout(resolve, 50));
        deployment.status = "running";
        await deployment.save();
        console.log("Job successfully running: "+deployment._id);
        console.log(deployment.projectPath);
        const apps = await detectApps(deployment.projectPath);
        console.log(apps);
    } catch (error) {
        deployment.status = "failed";
        await deployment.save();
        console.log(error.message);
    }
};

const deploymentWorker = new Worker("deployment-queue", async (job) => {
    const {id} = job.data;
    console.log("Job recieved: "+id);

    try {
        const deployment = await getDeploymentById(id);
        if(!deployment || !checkDeploymentStatus(deployment, "queued")){
            return;
        }
        await buildHandler(deployment);
    } catch (error) {
        console.log(error.message);
    }
}, {
    connection: redis,
    concurrency: 3
});

export default deploymentWorker;