import IORedis from "ioredis";

export const redisConnection = new IORedis({
  host: "redis-16749.c91.us-east-1-3.ec2.cloud.redislabs.com",
  port: 16749,
  username: "default",
  password: "1dJKQ3vvZEA0AZyEsWkgdzhrMXbol8gg",
  family:4,
  maxRetriesPerRequest: null,
});