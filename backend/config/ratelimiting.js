import rateLimit from "express-rate-limit";


export const limiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 3,

    keyGenerator: (req) => {
        return req.user?.id || req.ip;
    },

    handler: (req, res) => {
        console.log("🚨 Rate limit hit for:", req.user?.id);
        res.status(429).json({
            message: "Too many uploads, try later"
        });
    }
});