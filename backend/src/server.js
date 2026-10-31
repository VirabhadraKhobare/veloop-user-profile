
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VELOop Rewards API is running",
    database: mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

async function startServer() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from backend/.env");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  console.log("MongoDB connected successfully");

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`VELOop API running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start VELOop API:", error.message);
  process.exit(1);
});
