const express = require("express");
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const User = require("../models/User");
const Referral = require("../models/Referral");
const Wallet = require("../models/Wallet");
const {
  authCookieName,
  requireAuth,
  setAuthCookie,
  signToken,
} = require("../middleware/auth");

const router = express.Router();

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
});

const registrationSchema = credentialsSchema.extend({
  fullName: z.string().trim().min(2).max(100),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,30}$/),
  referralCode: z
    .string()
    .trim()
    .toUpperCase()
    .min(6)
    .max(20)
    .optional()
    .or(z.literal("")),
});

const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,30}$/),
  avatarUrl: z.string().trim().url().max(500).or(z.literal("")),
});

function validationError(res, error) {
  return res.status(400).json({
    success: false,
    message: "Invalid request data",
    errors: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  });
}

router.post("/register", async (req, res, next) => {
  const parsed = registrationSchema.safeParse(req.body);

  if (!parsed.success) {
    return validationError(res, parsed.error);
  }

  try {
    const { fullName, username, email, password, referralCode } = parsed.data;
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    }).select("_id email username");

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      return res.status(409).json({
        success: false,
        message: `A user with this ${field} already exists`,
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const referrer = referralCode
      ? await User.findOne({ referralCode, status: "active" }).select("_id")
      : null;
    if (referralCode && !referrer) {
      return res
        .status(400)
        .json({ success: false, message: "Referral code is invalid" });
    }
    const generatedReferralCode =
      `${username.slice(0, 8)}${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
    const user = await User.create({
      fullName,
      username,
      email,
      passwordHash,
      referralCode: generatedReferralCode,
      referredBy: referrer?._id || null,
    });
    await Wallet.create({ user: user._id });
    if (referrer) {
      await Referral.create({ referrer: referrer._id, referredUser: user._id });
    }
    const token = signToken(user._id);

    setAuthCookie(res, token);
    return res.status(201).json({ success: true, data: user.toSafeObject() });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or username is already in use",
      });
    }
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const parsed = credentialsSchema.safeParse(req.body);

  if (!parsed.success) {
    return validationError(res, parsed.error);
  }

  try {
    const { email, password } = parsed.data;
    const user = await User.findOne({ email }).select("+passwordHash");
    const passwordMatches = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !passwordMatches || user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    setAuthCookie(res, signToken(user._id));
    return res.status(200).json({ success: true, data: user.toSafeObject() });
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie(authCookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.status(200).json({ success: true, message: "Logged out" });
});

router.get("/me", requireAuth, (req, res) => {
  return res.status(200).json({ success: true, data: req.user.toSafeObject() });
});

router.patch("/me", requireAuth, async (req, res, next) => {
  const parsed = profileUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return validationError(res, parsed.error);
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: parsed.data },
      { new: true, runValidators: true },
    );

    return res.status(200).json({ success: true, data: user.toSafeObject() });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Username is already in use" });
    }
    return next(error);
  }
});

module.exports = router;
