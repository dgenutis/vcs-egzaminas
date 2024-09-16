import express from "express";
import * as controller from "../controller/reservationsController.js";
import requireAuth from "../middleware/authenticationMiddleware.js";
import requireAdminAuthorization from "../middleware/authorizationMiddleware.js";

const router = express.Router();

// GET - get all reservations
router.get("/", requireAuth, controller.getReservations);

router.get("/listing/:id", requireAuth, controller.getReservationsByListingId);

router.get("/me", requireAuth, controller.getMyReservations);

// GET - get a single reservation
router.get("/:id", requireAuth, controller.getReservation);

// POST - create new reservation
router.post("/", requireAuth, controller.createReservation);

// PATCH - update a reservation
router.patch("/:id", requireAuth, controller.updateReservation);

// DELETE - delete a reservation
router.delete(
  "/:id",
  requireAuth,
  requireAdminAuthorization,
  controller.deleteReservation
);

export default router;
