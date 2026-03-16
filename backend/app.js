import express from "express"
import dotenv from "dotenv"
import { connectDb } from "./config/db.js"
import authRoutes from "./routes/user.route.js"
import uploadRoute from "./routes/upload.route.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import path from "path"

dotenv.config()
const app=express()
const PORT=process.env.PORT
        
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true 
}))
app.use('/api/auth',authRoutes)
app.use('/api/videos',uploadRoute)
app.use("/streams", express.static(path.join(process.cwd(), "uploads/hls")))




app.listen(PORT,()=>{
    connectDb()
    console.log("Connected to server")
})