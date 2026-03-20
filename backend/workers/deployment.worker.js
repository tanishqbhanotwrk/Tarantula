import { Worker } from "bullmq";
import { redis } from "../connections/redis.connection.js"
import Deployment from "../models/deployment.model.js"

const getDeploymentById = async (id) => {
    try {
        const deployment = Deployment.findById(id);
        if(!deployment){
            console.log("No such deployment exists.");
            return;
        }
        return deployment;
    } catch (error) {
        console.log(error.message);
    }
};

const checkDeploymentStatus = (deployment, status) => {
    try {
        if(status === deployment.status){
            return true
        }
        return false
    } catch (error) {
        conosle.log(error.message);
    }
};

const buildHandler = (deployment) => {
    try {
        
    } catch (error) {
        
    }
};

const deploymentWorker = new Worker("deployment-queue", async (job) => {
    const {id} = job.data;
    console.log("Job recieved: "+id);

    try {
        
    } catch (error) {
        
    }
}, {
    connection: redis,
    concurrency: 3
});

export default deploymentWorker;