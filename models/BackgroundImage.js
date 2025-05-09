// models/BackgroundImage.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const backgroundImageSchema = new Schema({
    imageUrl: { type: String, required: true },  // URL of the uploaded image
    createdAt: { type: Date, default: Date.now },
});

const BackgroundImage  = mongoose.model('BackgroundImage', backgroundImageSchema);
export default BackgroundImage ;