import express from 'express'
import { uploadController } from '../controllers/video.controller.js'
import { protect } from '../middleware/protect.js'
import { uploadMiddleware } from '../config/multer.js'


const router=express.Router()


router.post('/upload',protect,uploadMiddleware.single('video'),uploadController)

export default router