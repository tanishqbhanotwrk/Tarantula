import App from "../models/app.model.js"

const updateEachApp = async (app, dockerfilePath) => {
    const dbapp = await App.findById(app._id);
    if(!dbapp) return null;
    dbapp.config = {
        ...(dbapp.config || {}),
        createdDockerfilePath: dockerfilePath
    }
    await dbapp.save();
    return dbapp._id;
}

export const updateAppSchemas = async (apps, results) => {
    const resultMap = new Map();

    for (const result of results) {
        resultMap.set(result.app, result.dockerfilePath);
    }

    const updatePromises = apps.map(app => {
        const dockerfilePath = resultMap.get(app.slug);

        if (!dockerfilePath) return null;

        return updateEachApp(app, dockerfilePath);
    });

    const updatedApps = await Promise.all(
        updatePromises.filter(Boolean)
    );

    return updatedApps;
}