import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, },
    password: { type: String , required: true},
    gender: { type: String, enum:["male", "female", "other"] },
    role: { type: String, enum: ["user", "admin"] , default: "user" },
}, { timestamps: true })

const User = mongoose.model("User", UserSchema);
export default User;