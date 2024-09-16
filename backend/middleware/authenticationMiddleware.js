import User from "../models/userModel.js";
import { verifyToken } from "../utils/jwt.js";

const requireAuth = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    verifyToken(token);
  } catch (error) {
    return res.sendStatus(401);
  }

  next();
};

export const addUserToRequest = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res
      .status(401)
      .send({ error: "No token provided, authorization denied" });
  }

  try {
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    res.status(401).send({ error: error.message });
  }
};

export default requireAuth;
