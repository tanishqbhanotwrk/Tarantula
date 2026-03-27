import fs from "fs";
import path from "path";
import net from "net";
import {exec} from "child_process";
import Deployment from "../models/deployment.model.js"
import App from "../models/app.model.js";

const getFreePort = () => {
    return new Promise((resolve, reject) => {
        const server = net.createServer();

        server.listen(0, () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });

        server.on("error", reject);
    });
};

const runCommand = (command, cwd) => {
    return new Promise((resolve, reject) => {
        exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                console.log("❌ Command failed:", command);
                console.log("STDOUT:", stdout);
                console.log("STDERR:", stderr);
                console.log("ERROR:", error.message);
                return reject(error);
            }

            console.log("✅ Command success:", command);
            console.log("STDOUT:", stdout);

            resolve(stdout);
        });
    });
};

export const runContainer = async (deploymentId) => {
    const deployment = await Deployment.findById(deploymentId).populate("apps");
    const projectPath = deployment.projectPath;

    for (const app of deployment.apps) {

        const fullPath = path.join(projectPath, app.path);

        let dockerfilePath = path.join(fullPath, "Dockerfile.generated");

        if (!fs.existsSync(dockerfilePath)) {
            dockerfilePath = path.join(fullPath, "Dockerfile");
        }

        if (!fs.existsSync(dockerfilePath)) {
            console.log("No Dockerfile for:", app.slug);

            app.status = "failed";
            await app.save();

            continue; 
        }

        const hostPort = await getFreePort();
        const containerPort = app.config?.containerPort || 3000;

        const imageTag = app.config?.imageTag || app.slug;

        console.log("Building image:", imageTag);

        await runCommand(
            `docker build -t ${imageTag} -f ${path.basename(dockerfilePath)} .`,
            fullPath
        );

        console.log(`Running ${imageTag} on port ${hostPort}`);

        const runOutput = await runCommand(
            `docker run -d -e PORT=${containerPort} -p ${hostPort}:${containerPort} ${imageTag}`,
            fullPath
        );

        const containerId = runOutput.trim();

        app.port = hostPort;
        app.containerId = containerId;
        app.status = "running";
        app.lastDeployedAt = new Date();
        app.hostPort = hostPort;

        await app.save();
    }
};