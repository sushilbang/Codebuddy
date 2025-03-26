import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import submissionRoutes from "./routes/submissionRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// API Routes
app.use("/api/submissions", submissionRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("CodeBuddy API is running 🚀");
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
