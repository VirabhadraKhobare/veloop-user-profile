require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth");
const rewardsRoutes = require("./routes/rewards");
const achievementsRoutes = require("./routes/achievements");
const referralsRoutes = require("./routes/referrals");
const withdrawalsRoutes = require("./routes/withdrawals");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from backend/.env");
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Try again later.",
  },
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/achievements", achievementsRoutes);
app.use("/api/referrals", referralsRoutes);
app.use("/api/withdrawals", withdrawalsRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VELOop Rewards API is running",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

app.use((error, req, res, next) => {
  console.error("API request failed:", error);
  if (res.headersSent) return next(error);
  return res.status(error.statusCode || 500).json({
    success: false,
    message: "An unexpected server error occurred",
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
