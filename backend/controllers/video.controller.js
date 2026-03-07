import Video from "../models/Video.model.js"

export const uploadController=async(req,res)=>{
try {
   const {videoName,description}=req.body
   const file=req.file

   if(!videoName){
    return res.status(400).json({message:"Video name is required"})
   }
   if(!file){
    return res.status(400).json({message:"Video file is required"})
   }

   const video=await Video.create({
    title:videoName,
    description,
    uploadedBy:req.user.id,
    status:"pending",
    filePath:file.path
   })
   // Worker queue logic can be added here to process the video asynchronously    



   res.status(201).json({message:"Video uploaded successfully",videoId:video.id})
} catch (error) {
    res.status(500).json({message:"Error uploading video",error:error.message})
    console.error("Error uploading video:", error)
}
}