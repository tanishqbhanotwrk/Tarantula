 import fs from "fs";
import path from "path";

const nodeMetaData = (projectPath, appPath) => {
    const fullPath = path.join(projectPath, appPath);
    const pkgPath = path.join(fullPath, "package.json");

    if (!fs.existsSync(pkgPath)) {
        console.log("No package.json in:", fullPath);
        return null;
    }

    const content = fs.readFileSync(pkgPath, "utf-8");
    const pkg = JSON.parse(content);

    const startScript = pkg.scripts?.start || "node index.js";
    const buildScript = pkg.scripts?.build || null;

    return {
        runtime: "node",
        config: {
            startScript,
            buildScript
        }
    };
};

const pythonMetaData = () => {};

const dockerMetaData = (projectPath, appPath) => {
    const fullPath = path.join(projectPath, appPath);

    if(!fs.existsSync(path.join(fullPath, "DockerFile"))){
        console.log("DockerFile does not exist.");
        return;
    }


};

const yarnMetaData = () => {};

const pnpmMetaData = () => {};
 
 const dockerComposeMetaData = (projectPath, appPath) => {
    const fullPath = path.join(projectPath, appPath);

    const possibleFiles = [
        "docker-compose.yaml",
        "docker-compose.yml",
        "compose.yaml",
        "compose.yml"
    ];

    const composeFile = possibleFiles.find(file =>
        fs.existsSync(path.join(fullPath, file))
    );

    if (!composeFile) {
        console.log("No docker compose file exists in:", fullPath);
        return null;
    }

    return {
        runtime: "compose",
        config: {
            composeFilePath: composeFile
        }
    };
};

export const extractMetaData = async (projectPath, appPath, runtime) => {
    if (runtime === "docker") {
        return dockerMetaData(projectPath, appPath);
    }

    if (runtime === "compose") {
        return dockerComposeMetaData(projectPath, appPath);
    }

    if (runtime === "node") {
        return nodeMetaData(projectPath, appPath);
    }

    if (runtime === "python") {
        return pythonMetaData(projectPath, appPath);
    }

    return null;
};