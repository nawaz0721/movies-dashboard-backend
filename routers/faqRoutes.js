// routes/faqRoutes.js
import express from "express";
import FAQ from "../models/FAQ.js";
import { checkTokenBlacklist } from "./auth.js";

const router = express.Router();

// Get all FAQs
router.get("/", async (req, res) => {
    try {
        const faqs = await FAQ.find().sort({ createdAt: -1 });
        if (!faqs) {
            return res.status(404).json({ status: false, message: "No FAQs found" });
        }
        res.status(200).json({ status: true, data: faqs });
    } catch (error) {
        res.status(500).json({ status: false, message: "Server error" });
    }
});

// Add new FAQ (admin only)
router.post("/", checkTokenBlacklist , async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ status: false, message: "Unauthorized" });
        }
        
        const { question, answer } = req.body;
        const newFAQ = new FAQ({
            question,
            answer,
        });
        
        await newFAQ.save();
        res.status(201).json({ status: true, data: newFAQ });
    } catch (error) {
        res.status(500).json({ status: false, message: "Failed to add FAQ" });
    }
});

// Update FAQ (admin only)
router.put("/:id", checkTokenBlacklist , async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ status: false, message: "Unauthorized" });
        }
        
        const { question, answer } = req.body;
        const updatedFAQ = await FAQ.findByIdAndUpdate(
            req.params.id,
            { question, answer },
            { new: true }
        );
        
        if (!updatedFAQ) {
            return res.status(404).json({ status: false, message: "FAQ not found" });
        }
        
        res.status(200).json({ status: true, data: updatedFAQ });
    } catch (error) {
        res.status(500).json({ status: false, message: "Server error" });
    }
});

export default router;