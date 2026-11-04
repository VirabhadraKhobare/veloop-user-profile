const express = require("express");
const { z } = require("zod");
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const Withdrawal = require("../models/Withdrawal");
const RewardTransaction = require("../models/RewardTransaction");
const AdminAuditLog = require("../models/AdminAuditLog");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
const adjustmentSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(["ve", "sve", "gems", "tokens", "xp"]),
  amount: z.number().finite().refine((value) => value !== 0, "Amount cannot be zero"),
  reason: z.string().trim().min(3).max(300),
});
const statusSchema = z.object({
  status: z.enum(["approved", "rejected", "processing", "completed"]),
  reason: z.string().trim().min(3).max(300),
});

router.use(requireAuth, requireAdmin);

router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find({}).select("fullName username email role status memberSince").sort({ createdAt: -1 }).limit(200).lean();
    return res.json({ success: true, data: users });
  } catch (error) {
    return next(error);
  }
});

router.get("/withdrawals", async (req, res, next) => {
  try {
    const items = await Withdrawal.find({ status: { $in: ["pending", "approved", "processing"] } }).populate("user", "fullName username email").sort({ createdAt: 1 }).limit(200).lean();
    return res.json({ success: true, data: items });
  } catch (error) {
    return next(error);
  }
});

router.patch("/withdrawals/:id", async (req, res, next) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Status and reason are required" });
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ success: false, message: "Withdrawal not found" });
    const previousStatus = withdrawal.status;
    if (["completed", "rejected"].includes(previousStatus)) {
      return res.status(409).json({ success: false, message: "A completed or rejected withdrawal cannot be changed" });
    }
    withdrawal.status = parsed.data.status;
    withdrawal.rejectionReason = parsed.data.status === "rejected" ? parsed.data.reason : "";
    withdrawal.statusHistory.push({ status: parsed.data.status, reason: parsed.data.reason, changedBy: req.user._id });
    await withdrawal.save();
    if (parsed.data.status === "completed" || parsed.data.status === "rejected") {
      await Wallet.updateOne({ user: withdrawal.user }, { $inc: { reservedWithdrawal: -withdrawal.amount, ...(parsed.data.status === "completed" ? { tokens: -withdrawal.amount } : {}) } });
    }
    await AdminAuditLog.create({ admin: req.user._id, action: "withdrawal_status_change", targetType: "Withdrawal", targetId: withdrawal._id, reason: parsed.data.reason, previousValue: { status: previousStatus }, newValue: { status: withdrawal.status } });
    return res.json({ success: true, data: withdrawal });
  } catch (error) {
    return next(error);
  }
});

router.post("/rewards/adjust", async (req, res, next) => {
  const parsed = adjustmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid reward adjustment" });
  try {
    const user = await User.findById(parsed.data.userId).select("_id");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const wallet = await Wallet.findOneAndUpdate(
      { user: user._id, ...(parsed.data.amount < 0 ? { [parsed.data.type]: { $gte: Math.abs(parsed.data.amount) } } : {}) },
      { $inc: { [parsed.data.type]: parsed.data.amount } },
      { new: true }
    );
    if (!wallet) return res.status(400).json({ success: false, message: "Adjustment would make the balance negative" });
    const transaction = await RewardTransaction.create({ user: user._id, type: parsed.data.type, amount: parsed.data.amount, description: parsed.data.reason, source: "admin_adjustment" });
    await AdminAuditLog.create({ admin: req.user._id, action: "reward_adjustment", targetType: "User", targetId: user._id, reason: parsed.data.reason, newValue: { type: parsed.data.type, amount: parsed.data.amount } });
    return res.status(201).json({ success: true, data: { wallet, transaction } });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
