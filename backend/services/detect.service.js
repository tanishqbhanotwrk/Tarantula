import fs from "fs";
import path from "path";
import crypto from "crypto";

import { extractMetaData } from "./metadata.service.js";

const IGNORE = new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    "out"
]);

const dockerfileExists = (projectPath) => {
    return fs.existsSync(path.join(projectPath, "Dockerfile"));
};

const dockerComposeExists = (projectPath) => {
    const possibleFiles = [
        "docker-compose.yaml",
        "docker-compose.yml",
        "compose.yaml",
        "compose.yml"
    ];

    return possibleFiles.some(file =>
        fs.existsSync(path.join(projectPath, file))
    );
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

const detectProject = (projectPath) => {
    if (dockerComposeExists(projectPath)) return "compose";
    if (dockerfileExists(projectPath)) return "docker";
    if (hasPackageJson(projectPath)) return "node";
    if (hasRequirementsTxt(projectPath) || hasPyProject(projectPath)) return "python";

    return "unknown";
};

const waitForRepo = async (projectPath, maxRetries = 3) => {
    let retries = maxRetries;

    while (retries--) {
        if (!fs.existsSync(projectPath)) {
            await new Promise(r => setTimeout(r, 1000));
            continue;
        }

        const files = fs.readdirSync(projectPath).filter(f => f !== ".git");
        if (files.length > 0) return;

        await new Promise(r => setTimeout(r, 1000)); //eventuality
    }

    throw new Error("Repository not populated after clone.");
};

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

const appNameGenerator = (appPath, deploymentId, repoName) => {
    const baseName =
        appPath === "."
            ? `${repoName}-app`
            : `${repoName}-${appPath.split(/[\\/]/).pop()}`;

    const slugBase =
        baseName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || "app";

    const normalisedPath = appPath.toLowerCase().replace(/\/+$/, "");
    const input = `${deploymentId}:${normalisedPath}`;

    const hashBuffer = crypto.createHash("sha256").update(input).digest();
    const shortHash = base62(hashBuffer).slice(0, 8);

    const slug = `${slugBase}-${shortHash}`;

    return {
        name: baseName,
        slug,
        hash: shortHash
    };
};

export const detectApps = async (projectPath, deploymentId, repoName) => {
    const apps = [];

    await waitForRepo(projectPath);

    const rootType = detectProject(projectPath);

    if (rootType !== "unknown") {
        const { name, slug, hash } = appNameGenerator(".", deploymentId, repoName);

        apps.push({
            path: ".",
            runtime: rootType,
            name,
            slug,
            hash
        });
    }

    const files = fs.readdirSync(projectPath);

    for (const file of files) {
        if (IGNORE.has(file)) continue;

        const fullPath = path.join(projectPath, file);

        if (fs.statSync(fullPath).isDirectory()) {
            const runtime = detectProject(fullPath);

            if (runtime !== "unknown") {
                const { name, slug, hash } = appNameGenerator(file, deploymentId, repoName);

                apps.push({
                    path: file,
                    runtime,
                    name,
                    slug,
                    hash
                });
            }
        }
    }

    console.log(apps);

    for (const app of apps) {
        const meta = await extractMetaData(projectPath, app.path, app.runtime, app.slug);

        if (meta) {
            app.runtime = meta.runtime;

            app.config = {
                ...(app.config || {}),
                ...(meta.config || {})
            };
        }
    }

    return apps;
};