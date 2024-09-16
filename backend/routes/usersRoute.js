import express from "express";
import {
  loginUser,
  signupUser,
  deleteUser,
  updateUser,
  getUser,
  getUsers,
  logoutUser,
  checkAuth,
  checkCookie,
} from "../controller/usersController.js";
import requireAuth, {
  addUserToRequest,
} from "../middleware/authenticationMiddleware.js";
import requireAdminAuthorization from "../middleware/authorizationMiddleware.js";

const router = express.Router();

// visi useriai
router.get("/", requireAuth, requireAdminAuthorization, getUsers);

router.get("/check-cookie", checkCookie);

router.get("/check-auth", addUserToRequest, checkAuth);

// vienas useris
router.get("/:id", requireAuth, requireAdminAuthorization, getUser);

// login route
router.post("/login", loginUser);

// logout route
router.post("/logout", requireAuth, logoutUser);

// signup route
router.post("/signup", signupUser);

// delete route
router.delete("/:id", requireAuth, requireAdminAuthorization, deleteUser);

// patch route
router.patch("/:id", requireAuth, requireAdminAuthorization, updateUser);

export default router;
