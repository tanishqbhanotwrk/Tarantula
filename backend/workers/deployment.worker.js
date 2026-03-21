import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import {exec} from "child_process";
import fs from "fs";
import crypto from "crypto";

import { Worker } from "bullmq";
import { redis } from "../connections/redis.connection.js";
import { connectDB } from "../connections/mongoose.connection.js";
import Deployment from "../models/deployment.model.js";

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
        await cloneRepo(deployment);
        deployment.status = "building";
        await deployment.save();
        console.log("Job building in progress: "+deployment._id);

        await new Promise((resolve) => setTimeout(resolve, 50));
        deployment.status = "running";
        await deployment.save();
        console.log("Job successfully running: "+deployment._id);
    } catch (error) {
        deployment.status = "failed";
        await deployment.save();
        console.log(error.message);
    }
};

const runCommand = (cmd, cwd) => {
    new Promise((resolve, reject) => {
        exec(cmd, {cwd}, (err, stdout, stderr) => {
            if(err) {
                reject(stderr);
            } else {
                resolve(stdout);
            }
        })
    })
};

const cloneRepo = async (deployment) => {
    const baseDir = process.env.DEPLOYMENTS_DIR;
    console.log("repoUrl:", deployment.repoUrl);
    if(!fs.existsSync(baseDir)){
        fs.mkdirSync(baseDir, {recursive: true});
    }

    try {
        const id = crypto.randomBytes(3).toString("hex");
        const repoName = deployment.repoUrl.split("/").pop().replace(".git", "");
        const folderName = `${repoName}-${id.slice(-6)}`;
        const projectPath = path.join(baseDir, folderName);
        await runCommand(`git clone ${deployment.repoUrl} ${projectPath}`);
        console.log("Repository cloned successfully.");
        deployment.projectPath = projectPath;
        await deployment.save();
        return projectPath;
    } catch (error) {
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