const multer = require("multer");
const storage = multer.diskStorage({});

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image")) {
    cb("Supported only image files!", false);
  }
  console.log(file);
  cb(null, true);
};

const videoFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("video")) {
    cb("Supported only video files!", false);
  }
  console.log(file);
  cb(null, true);
};

exports.uploadImage = multer({ storage, imageFileFilter });
exports.uploadVideo = multer({ storage, videoFileFilter });
