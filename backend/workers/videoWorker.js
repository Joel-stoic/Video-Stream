import { Worker } from "bullmq";
import { cacheRedis, redisConnection } from "../config/redis.js";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import Video from "../models/Video.model.js";
import { connectDb } from "../config/db.js";
import dotenv from "dotenv"; // 👈 ADD THIS
dotenv.config();
connectDb()


const worker = new Worker(
  "video-processing",
  async (job) => {
    const { videoId, filePath } = job.data;

    console.log("Processing video:", videoId);

    const outputDir = path.join("uploads", "hls", videoId);

    // create folder if not exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const qualities = [
      { name: "360p", size: "640x360", bitrate: "800k", bandwidth: 800000 },
      { name: "480p", size: "854x480", bitrate: "1400k", bandwidth: 1400000 },
      { name: "720p", size: "1280x720", bitrate: "2800k", bandwidth: 2800000 }
    ];

    for (const q of qualities) {
      const outputPath = path.join(outputDir, `${q.name}.m3u8`);

      await new Promise((resolve, reject) => {
        ffmpeg(filePath)
          .size(q.size)
          .videoBitrate(q.bitrate)
          .addOptions([
            "-profile:v main",
            "-preset fast",
            "-g 48",
            "-sc_threshold 0",
            "-hls_time 10",
            "-hls_list_size 0",
            "-f hls"
          ])
          .output(outputPath)
          .on("end", () => {
            console.log(`${q.name} processing finished`);
            resolve();
          })
          .on("error", (err) => {
            console.error("FFmpeg error:", err);
            reject(err);
          })
          .run();
      });
    }

    // Generate master playlist
    const masterPlaylist = `#EXTM3U
#EXT-X-VERSION:3

#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=854x480
480p.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p.m3u8
`;

    fs.writeFileSync(path.join(outputDir, "master.m3u8"), masterPlaylist);
    await Video.findByIdAndUpdate(videoId, { status: "completed" });
    await cacheRedis.del("completed-video") 
    console.log("Video processed:", videoId);
  },
  {
    connection: redisConnection,
    concurrency: 2,
    removeOnComplete: {
      age: 900,
      count: 100
    }
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed`, err);
});