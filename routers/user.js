import express from "express";
import User from "../models/User.js";

const router = express.Router();

// 🟢 USER GET API - Fetch all users
router.get("/user", async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users", error });
    }
  });
  
  // 🟢 USER PUT API - Update existing user
  router.put("/user/:id", async (req, res) => {
    const { name, email, contact, monthlyFund } = req.body;
    const userId = req.params.id;
  
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          name,
          email,
          contact,
          monthlyFund
        },
        { new: true }
      );
  
      res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: "Error updating user", error });
    }
  });
  

  export default router;