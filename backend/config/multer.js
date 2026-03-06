import multer from "multer"
import fs from "fs"
import path from "path"


// Multer storage configuration





// Ensure the uploads directory exists

const uploadDir="uploads/videos"
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir,{recursive:true})
}