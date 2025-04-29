import express from "express";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import authRoutes from "./routers/auth.js";
import contactRoutes from "./routers/contactRoutes.js";
import contactInfoRoutes from "./routers/contactInfoRoutes.js";
import faqRoutes from "./routers/faqRoutes.js";



import helmet from "helmet";
import rateLimit from "express-rate-limit";
const app = express();

app.use(helmet()); // Security Headers

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP
  })
);

// const PORT = 4000;

app.use(morgan("tiny"));
app.use(express.json());
// http://127.0.0.1:5500/
app.use(
  cors({
    origin: ["http://127.0.0.1:5500"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

mongoose
  .connect(process.env.MONGODB_URI , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongodb Connected"))
  .catch((err) => console.log("mongodb Connection Error: ", err));

// Use routes
app.use("/auth", authRoutes);
app.use("/contact", contactRoutes);
app.use("/contactInfo", contactInfoRoutes);
app.use("/faq", faqRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT, () => console.log("SERVER IS RUNNING"));
