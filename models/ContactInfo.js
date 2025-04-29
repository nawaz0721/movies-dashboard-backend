// models/ContactInfo.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const ContactInfoSchema = new Schema({
    phone: { type: String },
    email: { type: String },
    instagram: { type: String },
}, { timestamps: true });

const ContactInfo = mongoose.model("ContactInfo", ContactInfoSchema);
export default ContactInfo;