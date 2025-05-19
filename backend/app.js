import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/mongodb.js";
import cors from "cors"

// Load environment variables
dotenv.config();

// Import Routes
import shortUrlRoutes from "./src/routes/shortUrlRoute.js";
import authRoutes from "./src/routes/authRoutes.js"; // Corrected path

// Initialize App
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json()); // Parse JSON bodies

// Routes
app.use("/api/auth", authRoutes); // 🔐 Authentication routes
app.use("/", shortUrlRoutes); // 🔗 URL shortener routes

// Fallback route for 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
