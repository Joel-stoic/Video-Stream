import rateLimit from "express-rate-limit";


export const limiter=rateLimit({
    windowMs:15*60*10000,
    max:10,
    message:"Too many uploads, try later"
})