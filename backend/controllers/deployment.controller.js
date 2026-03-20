import Deployment from "../models/deployment.model.js"
import deploymentQueue from "../queues/deployment.queue.js";

const addDeploymentToQueue = async (deployment) => {
    try {
        await deploymentQueue.add("deploy", {
            id: deployment._id,
            repoUrl: deployment.repoUrl,
            repoName: deployment.repoName
        }, {
            attempts: 5,
            backoff: {
                type: "exponential",
                delay: 5000
            },
            removeOnComplete: true,
            removeOnFail: false
        });

        deployment.status = "queued";
        await deployment.save();

    } catch (error) {
        deployment.status = "failed";
        await deployment.save();
        console.error("Queue error:", error);
        throw error;
    }
}

export const createDeployment = async (req, res) => {
    try {
        const deployment = new Deployment({
            repoUrl: req.body.repoUrl,
            repoName: req.body.repoName
        });
        await deployment.save();
        console.log("Deployment created.");
        await addDeploymentToQueue(deployment);
        return res.status(200).json({success: true, message: "Job added: "+deployment._id})
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
};

export const getDeploymentStatusById = async (req, res) => {
    try {
        const deployment = await Deployment.findById({id: req.params.id});
        if(!deployment){
            return res.send("This deployment does not exist.");
        }
        return res.json(deployment.status);
    } catch (error) {
        return res.status(500).json({success: false, message: error});
    }
};

export const getAllDeployments = async (req, res) => {
    try {
        const deployments = await Deployment.find({});
        if(!deployments){
            return res.send("No deployments exist");
        }
        return res.json(deployments);
    } catch (error) {
        return res.status(500).json({success: false, message: error});
    }
};

export const deleteDeploymentById = async (req, res) => {
    try {
        const deployment = await Deployment.findByIdAndDelete({id: req.params.id});
        return res.json("Deployment ", deployment.id, " deleted.");
    } catch (error) {
        return res.status(500).json({success: false, message: error});
    }
};