import fs from "fs";
import path from "path";

const dockerfileExists = (projectPath) => {
    return fs.existsSync(path.join(projectPath, "Dockerfile"));
};

const hasPackageJson = (projectPath) => {
    return fs.existsSync(path.join(projectPath, "package.json"));
};

const hasRequirementsTxt = (projectPath) => {
    return fs.existsSync(path.join(projectPath, "requirements.txt"));
};

const hasPyProject = (projectPath) => {
    return fs.existsSync(path.join(projectPath, "pyproject.toml"))
};

const detectProject = (projectPath) => {
    if(dockerfileExists(projectPath)) return "dockerfile";

    else if(hasPackageJson(projectPath)) return "node";

    else if(hasRequirementsTxt(projectPath)) return "python";

    else if(hasPyProject(projectPath)) return "python";

    else return "unknown";
};

const waitForRepo = async (projectPath, maxRetries = 3) => {  //eventual consistency handling
    let retries = maxRetries;
    while(retries--){
        const files = fs.readdirSync(projectPath).filter(f => f !== ".git");
        if(files.length > 0) return;
        await new Promise(r => setTimeout(r, 1000));
    }
    throw new Error("Repository not populated after clone.");
}

export const detectApps = async (projectPath) => {
    const apps = [];
    await waitForRepo(projectPath);
    console.log("projectPath:", projectPath);
    console.log("files:", fs.readdirSync(projectPath));

    const rootType = detectProject(projectPath);
    if (rootType !== "unknown") {
        apps.push({ path: ".", type: rootType });
    }

    const files = fs.readdirSync(projectPath);

    for (const file of files) {
        if (file === "node_modules" || file === ".git") continue;

        const fullPath = path.join(projectPath, file);

        if (fs.statSync(fullPath).isDirectory()) {
            const type = detectProject(fullPath);

            if (type !== "unknown") {
                apps.push({
                    path: file,
                    type
                });
            }
        }
    }

    return apps;
};