import logger from "../config/logger.js"
import Video from "../models/Video.model.js"
import { videoQueue } from "../queue/videoQueue.js"
import WatchHistory from "../models/WatchHistory.model.js";
import { cacheRedis} from "../config/redis.js";

export const uploadController = async (req, res) => {
    try {
        const { videoName, description } = req.body
        const file = req.file

        if (!videoName) {
            return res.status(400).json({ message: "Video name is required" })
        }
        if (!file) {
            return res.status(400).json({ message: "Video file is required" })
        }

        const video = await Video.create({
            title: videoName,
            description,
            uploadedBy: req.user.id,
            status: "pending",
            filePath: file.path
        })
        // Worker queue logic can be added here to process the video asynchronously    

        await videoQueue.add("transcode-video",{
            videoId:video._id,
            filePath:file.path
        })

        res.status(201).json({ message: "Video uploaded successfully", videoId: video.id })
    } catch (error) {
        res.status(500).json({ message: "Error uploading video", error: error.message })
        console.error("Error uploading video:", error)
    }
}

export const getVideoControllers = async (req, res) => {
  try {
    const cached = await cacheRedis.get("completed-video")
    
    console.log('Cache hit:', !!cached)  // ← add this
    
    if(cached){
      console.log('Serving from Redis cache')  // ← add this
      return res.status(200).json({ videos: JSON.parse(cached) })
    }

    console.log('Fetching from MongoDB')  // ← add this
    const videos = await Video.find({ status: "completed" })
    if (videos.length === 0) {
      return res.status(404).json({ message: "No videos found" })
    }

    await cacheRedis.set("completed-video", JSON.stringify(videos), 'EX', 60)
    console.log('Saved to cache')  // ← add this
    
    return res.status(200).json({ videos })
  } catch (error) {
    console.error("Failed to fetch videos:", error)
    res.status(500).json({ message: "Error fetching videos", error: error.message })
  }
}



// SAVE progress
export const saveProgress = async (req, res) => {
  const { videoId, currentTime } = req.body;

  await WatchHistory.findOneAndUpdate(
    { userId: req.user.id, videoId },
    { currentTime },
    { upsert: true, new: true }
  );

  res.json({ success: true });
};


// GET progress
export const getProgress = async (req, res) => {
  const { videoId } = req.params;

  const data = await WatchHistory.findOne({
    userId: req.user.id,
    videoId,
  });

  res.json({ currentTime: data?.currentTime || 0 });
};