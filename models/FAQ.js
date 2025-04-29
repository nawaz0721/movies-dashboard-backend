// models/FAQ.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const FAQSchema = new Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
}, { timestamps: true });

const FAQ = mongoose.model("FAQ", FAQSchema);
export default FAQ;