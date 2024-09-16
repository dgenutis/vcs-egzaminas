import express from "express";
import { upload } from "../middleware/uploadsMiddleware.js";
import { uploadImages } from "../controller/uploadsController.js";
import requireAuth from "../middleware/authenticationMiddleware.js";
import requireAdminAuthorization from "../middleware/authorizationMiddleware.js";

const router = express.Router();

router.post(
  "/images",
  requireAuth,
  requireAdminAuthorization,
  upload.array("images", 5), // Allow up to 5 images
  uploadImages
);

export default router;
