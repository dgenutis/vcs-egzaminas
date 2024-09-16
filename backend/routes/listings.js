import express from "express";
import * as controller from "../controller/listingsController.js";
import requireAuth from "../middleware/authenticationMiddleware.js";
import requireAdminAuthorization from "../middleware/authorizationMiddleware.js";

const router = express.Router();

// GET - get all listings
router.get("/", controller.getListings);

// GET - get a single listing
router.get("/:id", controller.getListing);

// POST - create new listing
router.post(
  "/",
  requireAuth,
  requireAdminAuthorization,
  controller.createListing
);

// PATCH - update a listing
router.patch(
  "/:id",
  requireAuth,
  requireAdminAuthorization,
  controller.updateListing
);

// DELETE - delete a listing
router.delete(
  "/:id",
  requireAuth,
  requireAdminAuthorization,
  controller.deleteListing
);

export default router;
