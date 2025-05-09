import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import Joi from "joi";
import jwt from "jsonwebtoken";
import "dotenv/config";

import dotenv from "dotenv";
dotenv.config();


const router = express.Router();
const tokenBlacklist = new Set();

// 🔹 Middleware to Check if Token is Blacklisted
export const checkTokenBlacklist = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token && tokenBlacklist.has(token)) {
    return res.status(401).json({
      status: false,
      message: "Token is no longer valid",
    });
  }
  next();
};
router.use(checkTokenBlacklist);

// 🔹 Joi Validation Schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmpassword: Joi.string().min(6).required(),
  gender: Joi.string().valid("male", "female", "other").required(),  // Fixed this line
  role: Joi.string().valid("user", "admin").default("user"),
});

// 🟢 REGISTER API
router.post("/register", async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
 
  if (error) {
    return res.status(400).json({ status: false, message: error.details[0].message });
  }

  const existingUser = await User.findOne({ email: value.email });
  if (existingUser) {
    return res.status(403).json({ status: false, message: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(value.password, 12);
  value.password = hashedPassword;

  const newUser = new User({ ...value, password: hashedPassword });
  await newUser.save();

  res.status(201).json({ status: true, message: "User registered successfully", data: newUser });
});

// 🟢 LOGIN API
router.post("/login", async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
 
  if (error) {
    return res.status(400).json({ status: false, message: error.details[0].message });
  }

  const user = await User.findOne({ email: value.email }).lean();
  if (!user) {
    return res.status(403).json({ status: false, message: "User is not registered" });
  }

  const isPasswordValid = await bcrypt.compare(value.password, user.password);
  if (!isPasswordValid) {
    return res.status(403).json({ status: false, message: "Incorrect Credentials" });
  }

  const token = jwt.sign(user, process.env.AUTH_SECRET);
  res.status(200).json({ status: true, message: "User login successful", data: { user, token } });
});

// 🔴 LOGOUT API
router.post("/logout", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(400).json({ status: false, message: "Token is required for logout" });
  }

  jwt.verify(token, process.env.AUTH_SECRET, (err) => {
    if (err) {
      return res.status(403).json({ status: false, message: "Invalid token" });
    }
    tokenBlacklist.add(token);
    res.status(200).json({ status: true, message: "User logged out successfully" });
  });
});


export default router;
