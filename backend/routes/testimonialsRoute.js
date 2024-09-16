import express from "express";
import requireAuth from "../middleware/authenticationMiddleware";
import requireAdminAuthorization from "../middleware/authorizationMiddleware";
import {
  createTestimonial,
  deleteTestimonial,
  getAllTestimonials,
  getTenLatestTestimonials,
  getTestimonialById,
  updateTestimonial,
} from "../controller/testimonialsController";

const router = express.Router();

router.get("/", requireAuth, requireAdminAuthorization, getAllTestimonials);
router.get("/latest", getTenLatestTestimonials);
router.get("/:id", requireAuth, requireAdminAuthorization, getTestimonialById);
router.post("/", requireAuth, requireAdminAuthorization, createTestimonial);
router.patch("/:id", requireAuth, requireAdminAuthorization, updateTestimonial);
router.delete(
  "/:id",
  requireAuth,
  requireAdminAuthorization,
  deleteTestimonial
);

export default router;
