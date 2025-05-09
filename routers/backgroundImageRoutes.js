import express from 'express';
import BackgroundImage from '../models/BackgroundImage.js';
import cloudinary from 'cloudinary';
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


// 🟢 Upload background image to Cloudinary and save URL in the DB
router.post('/upload', checkTokenBlacklist, async (req, res) => {
  try {
    const { file } = req.files;  // Assuming you're using express-fileupload

    if (!file) {
      return res.status(400).json({ status: false, message: 'No file uploaded' });
    }

    // Upload image to Cloudinary
    cloudinary.v2.uploader.upload(file.tempFilePath, { folder: 'background_images' }, async (err, result) => {
      if (err) {
        return res.status(500).json({ status: false, message: 'Cloudinary upload failed' });
      }

      // Save image URL to database
      const newBackgroundImage = new BackgroundImage({
        imageUrl: result.secure_url,  // URL returned by Cloudinary
      });

      await newBackgroundImage.save();

      return res.status(201).json({ status: true, message: 'Background image uploaded successfully', data: newBackgroundImage });
    });
  } catch (error) {
    console.error('Error uploading background image:', error);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
});

// 🟢 Get background image
router.get('/', async (req, res) => {
  try {
    const image = await BackgroundImage.findOne();  // Assuming only one image is stored at a time
    if (!image) {
      return res.status(404).json({ status: false, message: 'No background image found' });
    }

    return res.status(200).json({ status: true, data: image });
  } catch (error) {
    console.error('Error fetching background image:', error);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
});

// 🟢 Delete background image
router.delete('/', checkTokenBlacklist, async (req, res) => {
  try {
    const image = await BackgroundImage.findOneAndDelete();  // Assuming only one image is stored
    if (!image) {
      return res.status(404).json({ status: false, message: 'No background image found' });
    }

    return res.status(200).json({ status: true, message: 'Background image deleted successfully' });
  } catch (error) {
    console.error('Error deleting background image:', error);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
});

export default router;