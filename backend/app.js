import express from "express"
import dotenv from "dotenv"
import { connectDb } from "./config/db.js"
import authRoutes from "./routes/user.route.js"
dotenv.config()
const app=express()
const PORT=process.env.PORT

app.use(express.json())

app.use('/api/auth',authRoutes)
// app.use('/api/videos',uploadRoute)



app.listen(PORT,()=>{
    connectDb()
    console.log("Connected to server")
})