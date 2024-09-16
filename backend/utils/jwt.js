import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const secret = process.env.SECRET;
const maxAge = process.env.JWT_MAX_AGE || 172800;

if (!secret) {
  console.log("SECRET is not defined in environment variables");
  process.exit(1);
}

export const signToken = (id, role = "user") => {
  return jwt.sign({ id, role }, secret, {
    expiresIn: `${maxAge}s`,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error(`Token verification failed: ${error}`);
  }
};
