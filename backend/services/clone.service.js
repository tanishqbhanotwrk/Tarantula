import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const runCommand = (cmd, cwd) => new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (err, stdout, stderr) => {
        console.log("CMD:", cmd);
        console.log("STDOUT:", stdout);
        console.log("STDERR:", stderr);

        if (err) reject(err);
        else resolve(stdout);
    });
});

export const cloneRepo = async (deploymentId, repoUrl) => {
    const baseDir = process.env.DEPLOYMENTS_DIR;
    console.log("repoUrl:", repoUrl);
    if(!fs.existsSync(baseDir)){
        fs.mkdirSync(baseDir, {recursive: true});
    }

    try {
        const id = deploymentId.toString();
        const repoName = repoUrl.split("/").pop().replace(".git", "");
        const folderName = `${repoName}-${id.slice(-6)}`;
        const projectPath = path.join(baseDir, folderName);
        await runCommand(`git clone ${repoUrl} ${projectPath}`);
        console.log("Repository cloned successfully.");
        return projectPath;
    } catch (error) {
        console.log(error.message);
    }
};