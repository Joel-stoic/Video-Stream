import logger from "../config/logger.js"
import Video from "../models/Video.model.js"
import { videoQueue } from "../queue/videoQueue.js"
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
        const videos=await Video.find({status:"completed"})
        if(!videos.length >0){
            return res.status(400).json({message:"Video not found"})
        }
        return res.status(200).json({videos})
    } catch (error) {
        logger.error(err, "Failed to fetch videos");
        res.status(500).json({ message: "Error uploading video", error: error.message })
        console.error("Error uploading video:", error)
    }
}