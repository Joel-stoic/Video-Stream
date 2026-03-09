import IORedis from "ioredis";

// export const redisConnection = new IORedis({
//   host: "redis-16749.c91.us-east-1-3.ec2.cloud.redislabs.com",
//   port: 16749,
//   username: "default",
//   password: "1dJKQ3vvZEA0AZyEsWkgdzhrMXbol8gg",
//   maxRetriesPerRequest: null,
// });

import { createClient } from 'redis';

export const redisConnection = createClient({
    username: 'default',
    password: '1dJKQ3vvZEA0AZyEsWkgdzhrMXbol8gg',
    socket: {
        host: 'redis-16749.c91.us-east-1-3.ec2.cloud.redislabs.com',
        port: 16749
    }
});

redisConnection.on("error",(err)=>{
    console.error("Redis error:",err);
})

await redisConnection.connect().then(()=>{
    console.log("Connected to redis")
})