import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";



// https://chatgpt.com/c/699762da-3ef8-8322-b0a4-e03aea107c65


export const videoQueue = new Queue("video-processing", {
  connection: redisConnection,
});