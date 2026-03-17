import express from 'express'
import { getProgress, getVideoControllers, saveProgress, uploadController } from '../controllers/video.controller.js'
import { protect } from '../middleware/protect.js'
import { uploadMiddleware } from '../config/multer.js'
import { limiter } from '../config/ratelimiting.js'


const router=express.Router()


router.post('/upload',protect,limiter,uploadMiddleware.single('video'),uploadController)

router.get('/getVideos',protect,getVideoControllers)

router.post("/progress",protect,saveProgress)
router.get("/progress/:videoId",protect,getProgress)

export default router

