import mongoose from "mongoose";

const videoSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    uploadedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    status:{
        type:String,
        default:"pending"
    },
    filePath:{
        type:String,
        required:true
    }
},{timestamps:true})

const Video=mongoose.model("Video",videoSchema)

export default Video
