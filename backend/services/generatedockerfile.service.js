import fs from "fs";
import path from "path";

const writeDockerFile = async (projectPath, appPath, content) => {
    const fullPath = path.join(projectPath, appPath, "Dockerfile");
    fs.writeFileSync(fullPath, content);
    return fullPath;
};

const generateContent = (app) => {
    if (app.runtime === "docker" || app.runtime === "compose") {
        return null;
    }

    if (app.runtime === "node" && app.config.buildScript) {
        return `
FROM node:18
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN "sh" "-c" ${app.config.buildScript}

CMD ["sh", "-c", "${app.config.startScript}"]
`;
    }

    if (app.runtime === "node") {
        return `
FROM node:18
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["sh", "-c", "${app.config.startScript}"]
`;
    }

    if (app.runtime === "python") {
        return `
FROM python:3.11
WORKDIR /app

COPY . .

RUN ${app.config.installCommand}

CMD ["sh", "-c", "${app.config.startCommand}"]
`;
    }

    return null;
};

export const generateDockerFile = async (projectPath, apps) => {
    const results = [];

    for (const app of apps) {
        const content = generateContent(app);

        if (!content) continue;

        const dockerfilePath = await writeDockerFile(projectPath, app.path, content);

        results.push({
            app: app.slug,
            dockerfilePath
        });
    }

    return results;
};