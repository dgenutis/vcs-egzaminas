import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinaryModule from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Initialize Cloudinary
const cloudinary = cloudinaryModule.v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "vcs-rentals",
    format: async (req, file) => {
      const allowedFormats = ["jpg", "jpeg", "png"];
      const ext = path.extname(file.originalname).slice(1);
      if (allowedFormats.includes(ext)) {
        return ext;
      }
      throw new Error("Invalid file format");
    },
    public_id: (req, file) => crypto.randomUUID(),
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  },
});

// Multer Middleware
export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG and PNG are allowed."));
    }
  },
});
