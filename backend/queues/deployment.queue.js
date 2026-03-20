import { Queue } from "bullmq";
import {redis} from "../connections/redis.connection.js";

const deploymentQueue = new Queue("deployment-queue", {
    connection: redis
});

export default deploymentQueue;