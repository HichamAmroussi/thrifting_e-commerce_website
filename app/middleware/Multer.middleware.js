// Packages
const multer = require('multer');
const path = require('path');

// Setting up Multer
module.exports = multer({
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname).toLocaleLowerCase();
        if(ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
            cb(new Error("File type is not supported"), false);
            return;
        }
        cb(null, true);
    }
})