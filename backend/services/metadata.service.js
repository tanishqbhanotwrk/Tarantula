import fs from "fs";
import path from "path";

const nodeMetaData = (projectPath, appPath) => {
    const fullPath = path.join(projectPath, appPath)
    const content = fs.readFileSync(path.join(fullPath, "package.json"), "utf-8");
    if (!fs.existsSync(path.join(fullPath, "package.json"))) {
        console.log("No package.json in:", projectPath);
        return;
    }
    const pkg = JSON.parse(content);

    const startScript = pkg.scripts?.start;
    const buildScript = pkg.scripts?.build;

    console.log(startScript);
    console.log(buildScript);
};

const pythonMetaData = () => {};

const dockerMetaData = () => {};

const yarnMetaData = () => {};

const pnpmMetaData = () => {};

export const extractMetaData = async (projectPath, appPath, framework) => {
    if(framework === "Dockerfile"){
        console.log("Dockerfile already exists");
        dockerMetaData(projectPath);
    }
    else if(framework === "node"){
        nodeMetaData(projectPath, appPath);
    }
    else if(framework === "python"){
        pythonMetaData(projectPath);
    }
    else if(framework === "yarn"){
        yarnMetaData(projectPath);
    }
    else if(framework === "pnpm"){
        pnpmMetaData(projectPath);
    } 
    else {
        console.log("Detected framework not supported");
    }
};