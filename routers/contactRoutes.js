// routes/contactRoutes.js
import express from 'express';
import Contact from '../models/ContactForm.js';
import { checkTokenBlacklist } from './auth.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { name, email,department, subject, message, userID } = req.body;
    console.log(req.body);
    
    
    const newContact = new Contact({
        name,
        email,
        message,
        User: userID ? userID : null, 
    });

    try {
        await newContact.save();
        res.status(201).send({ message: "Message received successfully." });
    } catch (error) {
        res.status(500).send({ message: "Failed to save the message." });
    }
});

router.get('/', checkTokenBlacklist , async (req, res) => {
    try {
        const contacts = await Contact.find().populate('User', 'name email');
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching contacts", error });
    }
});

export default router;