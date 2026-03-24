import Queue from "bullmq";
import { redis } from "../connections/redis.connection";

const cleanupQueue = new Queue("cleanup-queue", {
    connection: redis
});

export default cleanupQueue;