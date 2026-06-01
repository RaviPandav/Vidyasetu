const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsRoot = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(uploadsRoot, "avatars");

    if (file.fieldname === "thumbnail") {
      uploadPath = path.join(uploadsRoot, "thumbnails");
    } else if (file.mimetype.startsWith("video/")) {
      uploadPath = path.join(uploadsRoot, "videos");
    } else if (file.mimetype === "application/pdf") {
      uploadPath = path.join(uploadsRoot, "notes");
    }

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg", "image/png", "image/webp",
    "video/mp4", "video/webm", "video/quicktime",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    // IMPORTANT for Render: increase upload limit to avoid multer rejecting early.
    // Actual 413 can still happen at proxy/render level, but this reduces one common cause.
    fileSize: 200 * 1024 * 1024, // 200MB max upload
  },
});


module.exports = upload;
