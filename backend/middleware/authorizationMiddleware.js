import { verifyToken } from "../utils/jwt.js";

const requireAdminAuthorization = async (req, res, next) => {
  const token = req.cookies.jwt;
  const verifiedToken = verifyToken(token);

  if (verifiedToken.role !== "admin") {
    return res.sendStatus(403);
  }

  next();
};

export default requireAdminAuthorization;
