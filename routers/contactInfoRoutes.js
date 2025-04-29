// routes/contactInfoRoutes.js
import express from "express";
import ContactInfo from "../models/ContactInfo.js";
import { checkTokenBlacklist } from "./auth.js";

const router = express.Router();

// Get contact info
router.get("/", async (req, res) => {
    try {
        const contactInfo = await ContactInfo.findOne().sort({ createdAt: -1 });
        res.status(200).json({ status: true, data: contactInfo || {} });
    } catch (error) {
        res.status(500).json({ status: false, message: "Server error" });
    }
});

// Update contact info (admin only)
router.put("/", checkTokenBlacklist , async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ status: false, message: "Unauthorized" });
        }
        
        const { phone, email, instagram } = req.body;
        let contactInfo = await ContactInfo.findOne().sort({ createdAt: -1 });
        
        if (!contactInfo) {
            contactInfo = new ContactInfo({ phone, email, instagram, updatedBy: req.user._id });
        } else {
            contactInfo.phone = phone;
            contactInfo.email = email;
            contactInfo.instagram = instagram;
            contactInfo.updatedBy = req.user._id;
        }
        
        await contactInfo.save();
        res.status(200).json({ status: true, data: contactInfo });
    } catch (error) {
        res.status(500).json({ status: false, message: "Server error" });
    }
});

export default router;