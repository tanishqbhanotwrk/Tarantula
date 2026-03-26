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

const pythonMetaData = (projectPath, appPath) => {
    const fullPath = path.join(projectPath, appPath);

    const reqPath = path.join(fullPath, "requirements.txt");
    const pyProjectPath = path.join(fullPath, "pyproject.toml");

    if (!fs.existsSync(reqPath) && !fs.existsSync(pyProjectPath)) {
        console.log("No Python dependency file in:", fullPath);
        return null;
    }

    const possibleEntries = ["app.py", "main.py", "server.py", "run.py"];

    let entryFile = null;

    for (const file of possibleEntries) {
        if (fs.existsSync(path.join(fullPath, file))) {
            entryFile = file;
            break;
        }
    }

    const startCommand = entryFile
        ? `python ${entryFile}`
        : "python main.py";

    return {
        runtime: "python",
        config: {
            installCommand: fs.existsSync(reqPath)
                ? "pip install -r requirements.txt"
                : "pip install .",
            startCommand
        }
    };
};

const detectContainerPort = (projectPath, appPath) => {
    const fullPath = path.join(projectPath, appPath);
    const dockerfile = path.join(fullPath, "Dockerfile");

    if (!fs.existsSync(dockerfile)) {
        console.log("No dockerfile exists in:", fullPath);
        return null;
    }

    const content = fs.readFileSync(dockerfile, "utf-8");
    const match = content.match(/EXPOSE\s+(\d+)/i);

    return match ? parseInt(match[1]) : null;
};

const dockerMetaData = (projectPath, appPath) => {
    const fullPath = path.join(projectPath, appPath);

    if(!fs.existsSync(path.join(fullPath, "DockerFile"))){
        console.log("DockerFile does not exist.");
        return;
    }

    const detectedPort = detectContainerPort(projectPath, appPath);

    return {
        runtime: "docker",
        config: {
            dockerfilePath: appPath,
            imageTag: slug,
            containerPort: detectedPort
        }
    }
};
 
 const dockerComposeMetaData = (projectPath, appPath) => { //later on we'll extract more metadata so that we can run each container from the compose file separately as we wish
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

export const extractMetaData = async (projectPath, appPath, runtime, slug) => {
    if (runtime === "docker") {
        return dockerMetaData(projectPath, appPath, slug);
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