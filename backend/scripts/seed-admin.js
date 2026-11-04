require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../src/models/User");

async function seedAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are required");
  }
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");

  await mongoose.connect(process.env.MONGODB_URI);
  const username = process.env.ADMIN_SEED_USERNAME || "admin";
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      $set: {
        fullName: process.env.ADMIN_SEED_NAME || "VELOop Administrator",
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
        role: "admin",
        status: "active",
      },
      $setOnInsert: { memberSince: new Date() },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).select("email username role status");

  console.log(`Admin ready: ${admin.email} (${admin.role})`);
  await mongoose.disconnect();
}

seedAdmin().catch(async (error) => {
  console.error("Admin seed failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
