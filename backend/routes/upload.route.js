import express from 'express'
import { getVideoControllers, uploadController } from '../controllers/video.controller.js'
import { protect } from '../middleware/protect.js'
import { uploadMiddleware } from '../config/multer.js'
import { limiter } from '../config/ratelimiting.js'


const router=express.Router()


router.post('/upload',protect,limiter,uploadMiddleware.single('video'),uploadController)

router.get('/getVideos',protect,getVideoControllers)

export default router 