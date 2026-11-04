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
const userStatusSchema = z.object({
  status: z.enum(["active", "suspended"]),
  reason: z.string().trim().min(3).max(300),
});

router.use(requireAuth, requireAdmin);

router.get("/dashboard", async (req, res, next) => {
  try {
    const [users, activeUsers, suspendedUsers, walletTotals, withdrawals, pendingWithdrawals, auditLogs] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ status: "active" }),
        User.countDocuments({ status: "suspended" }),
        Wallet.aggregate([
          {
            $group: {
              _id: null,
              ve: { $sum: "$ve" },
              sve: { $sum: "$sve" },
              gems: { $sum: "$gems" },
              tokens: { $sum: "$tokens" },
              xp: { $sum: "$xp" },
            },
          },
        ]),
        Withdrawal.countDocuments(),
        Withdrawal.countDocuments({ status: { $in: ["pending", "approved", "processing"] } }),
        AdminAuditLog.find().sort({ createdAt: -1 }).limit(10).populate("admin", "username").lean(),
      ]);

    return res.json({
      success: true,
      data: {
        users: { total: users, active: activeUsers, suspended: suspendedUsers },
        walletTotals: walletTotals[0] || { ve: 0, sve: 0, gems: 0, tokens: 0, xp: 0 },
        withdrawals: { total: withdrawals, pending: pendingWithdrawals },
        recentAuditLogs: auditLogs,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const filter = {};
    if (["active", "suspended"].includes(req.query.status)) filter.status = req.query.status;
    if (req.query.search) {
      const search = String(req.query.search).trim();
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("fullName username email role status memberSince referralCode")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);
    return res.json({ success: true, data: { items: users, page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return next(error);
  }
});

router.get("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("fullName username email role status memberSince referralCode avatarUrl")
      .lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const [wallet, withdrawals, referrals, transactions] = await Promise.all([
      Wallet.findOne({ user: user._id }).lean(),
      Withdrawal.find({ user: user._id }).sort({ createdAt: -1 }).limit(50).lean(),
      Referral.find({ referrer: user._id }).sort({ createdAt: -1 }).limit(50).lean(),
      RewardTransaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(50).lean(),
    ]);
    return res.json({ success: true, data: { user, wallet, withdrawals, referrals, transactions } });
  } catch (error) {
    return next(error);
  }
});

router.patch("/users/:id/status", async (req, res, next) => {
  const parsed = userStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Status and reason are required" });
  }
  try {
    const user = await User.findById(req.params.id).select("status role");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user._id.equals(req.user._id) || user.role === "admin") {
      return res.status(409).json({ success: false, message: "Administrator accounts cannot be changed here" });
    }
    const previousStatus = user.status;
    user.status = parsed.data.status;
    await user.save();
    await AdminAuditLog.create({
      admin: req.user._id,
      action: "account_status_change",
      targetType: "User",
      targetId: user._id,
      reason: parsed.data.reason,
      previousValue: { status: previousStatus },
      newValue: { status: user.status },
    });
    return res.json({ success: true, data: { id: user._id, status: user.status } });
  } catch (error) {
    return next(error);
  }
});

router.get("/audit-logs", async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100);
    const [items, total] = await Promise.all([
      AdminAuditLog.find().populate("admin", "username email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      AdminAuditLog.countDocuments(),
    ]);
    return res.json({ success: true, data: { items, page, limit, total, pages: Math.ceil(total / limit) } });
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
