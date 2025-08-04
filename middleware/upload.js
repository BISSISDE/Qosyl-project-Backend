const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user?.id;
    const dir = `uploads/${userId}/`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /image\/(jpeg|jpg|png)/;
  const isValid = allowedTypes.test(file.mimetype);
  if (!isValid) {
    return cb(new Error("Only JPEG, JPG, and PNG files are allowed!"));
  }
  cb(null, isValid);
};

module.exports = {
  upload: multer({
    storage,
    fileFilter,
  }),
};
