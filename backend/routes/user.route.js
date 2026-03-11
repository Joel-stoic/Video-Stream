import express from 'express'
import { login, logout, register } from '../controllers/user.controller.js'
import { protect } from "../middleware/protect.js"


const router=express.Router()



router.post('/login',login)
router.post('/register',register)
router.post('/logout',logout)


router.get("/me", protect, (req, res) => {
  res.json({ user: req.user })
})


export default router