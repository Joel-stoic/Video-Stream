export const upload=async(req,res)=>{
try {
   const {videoName,description}=req.body
   const file=req.file

   if(!videoName){
    return res.status(400).json({message:"Video name is required"})
   }
   if(!file){
    return res.status(400).json({message:"Video file is required"})
   }
} catch (error) {
    res.status(500).json({message:"Error uploading video",error:error.message})
    console.error("Error uploading video:", error)
}
}