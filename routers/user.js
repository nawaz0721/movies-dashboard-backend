import express from "express";
import User from "../models/User.js";
import jwt from 'jsonwebtoken'; // Make sure to import jwt for token verification

const router = express.Router();

// 🔹 In-memory token blacklist (for example, you can replace this with a database or external service)
const tokenBlacklist = new Set(); // This stores blacklisted tokens

// 🔹 Middleware to Check if Token is Blacklisted
const checkTokenBlacklist = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token

  // If there's no token, return a 401 Unauthorized error
  if (!token) {
    return res.status(401).json({ status: false, message: "Authentication token is missing" });
  }

  // Check if the token is in the blacklist
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ status: false, message: "Token is blacklisted" });
  }

  // Verify the token and decode it
  jwt.verify(token, process.env.AUTH_SECRET, (err, decoded) => {
    if (err) {
      // Token is invalid or expired
      return res.status(403).json({ status: false, message: "Invalid or expired token" });
    }

    // If token is valid, attach the decoded user to req.user
    req.user = decoded; // Attach the decoded payload (user data) to req.user
    next(); // Continue to the next middleware/route handler
  });
};

// 🟢 GET current user data
router.get("/me", checkTokenBlacklist, async (req, res) => {
  try {
    // req.user should contain the user data if the JWT token is verified
    const user = req.user;

    if (!user) {
      return res.status(400).json({ status: false, message: "User not found" });
    }

    // Return the user's profile data (without the password)
    res.status(200).json({ status: true, data: user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// 🟢 PUT update current user info
router.put("/me", checkTokenBlacklist, async (req, res) => {
  try {
    const { name, email, gender } = req.body;
    
    // Ensure user data is in the request
    if (!name || !email || !gender) {
      return res.status(400).json({ status: false, message: "All fields (name, email, gender) are required" });
    }

    // Access the user's ID from req.user (set by JWT middleware)
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({ status: false, message: "User ID not found" });
    }

    // Attempt to find and update the user by their ID
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { name, email, gender },
      { new: true, runValidators: true }
    ).select("-password"); // Exclude password from the response

    console.log("Updated User:", updatedUser); // Log the updated user for debugging
    
    if (!updatedUser) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Return the updated user data
    res.status(200).json({ status: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

export default router;
