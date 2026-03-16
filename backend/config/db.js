import mongoose from "mongoose"


export const connectDb=async()=>{
    try {
        const conn=await mongoose.connect(process.env.MONGO_URI)
        if(!conn){
            console.log("Unable to connect to Mongodb")
        }
        console.log("MongoDb connected",conn.connection.host)
    } catch (error) {
        console.log("Unable to connect to Mongodb",error.message)
    }
}