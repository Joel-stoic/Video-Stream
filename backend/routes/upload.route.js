import express from 'express'
import { uploadController } from '../controllers/video.controller'
import { protect } from '../middleware/protect.js'


const router=express.Router()


router.post('upload',protect,uploadController)

export default router