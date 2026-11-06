const crypto = require("crypto");
const express = require("express");
const { z } = require("zod");
const Wallet = require("../models/Wallet");
const Withdrawal = require("../models/Withdrawal");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const withdrawalSchema = z.object({
  amount: z.number().positive().max(100000),
  payoutMethod: z.string().trim().min(2).max(40),
  payoutDetails: z.string().trim().min(2).max(300),
});
const MIN_WITHDRAWAL = 10;

router.use(requireAuth);

router.get("/summary", async (req, res, next) => {
  try {
    const wallet = await Wallet.findOneAndUpdate({ user: req.user._id }, { $setOnInsert: { user: req.user._id } }, { new: true, upsert: true, setDefaultsOnInsert: true }).lean();
    const [pending, completed] = await Promise.all([
      Withdrawal.aggregate([{ $match: { user: req.user._id, status: { $in: ["pending", "approved", "processing"] } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Withdrawal.aggregate([{ $match: { user: req.user._id, status: "completed" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);
    return res.json({ success: true, data: { available: Math.max(wallet.tokens - wallet.reservedWithdrawal, 0), pending: pending[0]?.total || 0, completed: completed[0]?.total || 0, minimum: MIN_WITHDRAWAL } });
  } catch (error) {
    return next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const items = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100).lean();
    return res.json({ success: true, data: items });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  const parsed = withdrawalSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid withdrawal request", errors: parsed.error.issues });
  const { amount, payoutMethod, payoutDetails } = parsed.data;
  if (amount < MIN_WITHDRAWAL) return res.status(400).json({ success: false, message: `Minimum withdrawal is ${MIN_WITHDRAWAL}` });
  try {
    const wallet = await Wallet.findOneAndUpdate(
      { user: req.user._id, $expr: { $gte: [{ $subtract: ["$tokens", "$reservedWithdrawal"] }, amount] } },
      { $inc: { reservedWithdrawal: amount } },
      { new: true }
    );
    if (!wallet) {
      const currentWallet = await Wallet.findOne({ user: req.user._id }).select("tokens reservedWithdrawal").lean();
      const available = Math.max((currentWallet?.tokens || 0) - (currentWallet?.reservedWithdrawal || 0), 0);
      return res.status(400).json({
        success: false,
        message: `Insufficient available balance. Available: ${available} tokens.`,
      });
    }
    try {
      const withdrawal = await Withdrawal.create({
        user: req.user._id,
        amount,
        payoutMethod,
        payoutDetails,
        referenceId: `WD-${crypto.randomBytes(6).toString("hex").toUpperCase()}`,
        statusHistory: [{ status: "pending", reason: "Request submitted", changedBy: req.user._id }],
      });
      return res.status(201).json({ success: true, data: withdrawal });
    } catch (error) {
      await Wallet.updateOne({ user: req.user._id }, { $inc: { reservedWithdrawal: -amount } });
      throw error;
    }
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = await Withdrawal.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!item) return res.status(404).json({ success: false, message: "Withdrawal not found" });
    return res.json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
