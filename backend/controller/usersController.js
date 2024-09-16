import Users from "../models/userModel.js";
import mongoose from "mongoose";
import { signToken, verifyToken } from "../utils/jwt.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const maxAge = process.env.JWT_MAX_AGE || 172800;

// GET - all users
export const getUsers = async (req, res) => {
  const users = await Users.find({}).sort({
    createdAt: -1,
  });
  res.status(200).json(users);
};

// GET - single user
export const getUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Tokio naudotojo nėra" });
  }
  const user = await Users.findById(id);
  if (!user) {
    return res.status(404).json({ error: "Tokio naudotojo nėra" });
  }
  res.status(200).json(user);
};

// POST - login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.login(email, password);
    const token = signToken(user._id, user.role);
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
      sameSite: "lax",
    });
    res.status(200).json({ email: user.email, username: user.username });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// POST - signup user
export const signupUser = async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const user = await Users.signup(email, password, username);
    const token = signToken(user._id);
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
      sameSite: "lax",
    });
    res
      .status(200)
      .json({ id: user._id, email: user.email, username: user.username });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE - delete single user
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Tokio naudotojo nėra" });
  }
  const user = await Users.findOneAndDelete({ _id: id });
  if (!user) {
    return res.status(404).json({ error: "Tokio naudotojo nėra" });
  }
  res.status(200).json(user);
};

// PATCH - update single user
export const updateUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Tokio naudotojo nėra" });
  }
  const user = await Users.findOneAndUpdate({ _id: id }, { ...req.body });
  if (!user) {
    return res.status(404).json({ error: "Tokio naudotojo nėra" });
  }
  res.status(200).json(user);
};

// POST - logout user
export const logoutUser = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.sendStatus(200);
};

export const checkAuth = async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.sendStatus(401);
  }

  res.send(user);
};

export const checkCookie = async (req, res) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(200).json({ isValid: false });
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(200).json({ isValid: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(200).json({ isValid: false });
  }

  res.status(200).json({ isValid: true });
};
