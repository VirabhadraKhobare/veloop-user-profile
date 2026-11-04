const express = require("express");
const { z } = require("zod");
const Wallet = require("../models/Wallet");
const RewardTransaction = require("../models/RewardTransaction");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const types = ["ve", "sve", "gems", "tokens", "xp"];

function pagination(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

router.use(requireAuth);

router.get("/summary", async (req, res, next) => {
  try {
    const wallet = await Wallet.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    const level = Math.floor(wallet.xp / 1000) + 1;
    const progress = wallet.xp % 1000;
    return res.json({
      success: true,
      data: {
        balances: { ve: wallet.ve, sve: wallet.sve, gems: wallet.gems, tokens: wallet.tokens, xp: wallet.xp },
        level,
        nextLevelXp: level * 1000,
        levelProgress: progress,
        levelProgressPercent: Math.round((progress / 1000) * 100),
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/transactions", async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const filter = { user: req.user._id };
    if (req.query.type && types.includes(req.query.type)) filter.type = req.query.type;
    if (["pending", "approved", "rejected"].includes(req.query.status)) filter.status = req.query.status;
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(`${req.query.to}T23:59:59.999Z`);
    }
    const [items, total] = await Promise.all([
      RewardTransaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      RewardTransaction.countDocuments(filter),
    ]);
    return res.json({ success: true, data: { items, page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return next(error);
  }
});

router.get("/transactions/:id", async (req, res, next) => {
  try {
    const item = await RewardTransaction.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!item) return res.status(404).json({ success: false, message: "Reward transaction not found" });
    return res.json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
