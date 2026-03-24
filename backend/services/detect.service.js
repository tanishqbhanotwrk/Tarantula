import fs from "fs";
import path from "path";
import crypto from "crypto";

import { extractMetaData } from "./metadata.service.js";

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
    return fs.existsSync(path.join(projectPath, "pyproject.toml"));
};

const hasYarn = (projectPath) => {
    return fs.existsSync(path.join(projectPath, "yarn.lock"));
};

const hasPnpm = (projectPath) => {
    return fs.existsSync(path.join(projectPath, "pnpm-lock.yaml"));
};

const detectProject = (projectPath) => {
    if(dockerfileExists(projectPath)) return "dockerfile";
    else if(hasPackageJson(projectPath)) return "node";
    else if(hasRequirementsTxt(projectPath)) return "python";
    else if(hasPyProject(projectPath)) return "python";
    else if(hasYarn(projectPath)) return "yarn";
    else if(hasPnpm(projectPath)) return "pnpm";
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

const base62 = (buffer) => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let num = BigInt("0x" + buffer.toString("hex"));
    let result = "";

    while (num > 0) {
        result = chars[num % 62n] + result;
        num = num / 62n;
    }

    return result || "0";
};

const appNameGenerator = (path, deploymentId, repoName) => {
    const baseName = path === "." ? `${repoName}-app` : `${repoName}-${path.split(/[\\/]/).pop()}`;
    const slugBase = baseName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "app";
    const normalisedPath = path.toLowerCase().replace(/\/+$/, "");
    const input = `${deploymentId}-${normalisedPath}`;
    const hashBuffer = crypto.createHash("sha256").update(input).digest();
    const shortHash = base62(hashBuffer).slice(0, 8);
    const slug = `${slugBase}-${shortHash}`;
    return {
        name: baseName,
        slug,
        hash: shortHash
    }
}

export const detectApps = async (projectPath, deploymentId, repoName) => {
    const apps = [];
    await waitForRepo(projectPath);
    console.log("projectPath:", projectPath);
    console.log("files:", fs.readdirSync(projectPath));

    const rootType = detectProject(projectPath);
    if (rootType !== "unknown") {
        const {name, slug, hash} = appNameGenerator(".", deploymentId, repoName)
        apps.push({ path: ".", framework: rootType, name: name, slug: slug, hash: hash });
    }

    const files = fs.readdirSync(projectPath);

    for (const file of files) {
        if (file === "node_modules" || file === ".git") continue;

        const fullPath = path.join(projectPath, file);

        if (fs.statSync(fullPath).isDirectory()) {
            const framework = detectProject(fullPath);
            const {name, slug, hash} = appNameGenerator(fullPath, deploymentId, repoName)
            if (framework !== "unknown") {
                apps.push({
                    path: file,
                    framework,
                    name: name, 
                    slug: slug, 
                    hash: hash
                });
            }
        }
    }
    apps.forEach(a => {
        extractMetaData(projectPath, a.path, a.framework);
    })
    console.log(apps);
    return apps;
};