import express from 'express'
import { upload } from '../controllers/video.controller'


const router=express.Router()


router.post('upload',upload)