const express = require("express");
const Referral = require("../models/Referral");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/summary", async (req, res, next) => {
  try {
    const [total, successful, pending, rewards] = await Promise.all([
      Referral.countDocuments({ referrer: req.user._id }),
      Referral.countDocuments({ referrer: req.user._id, status: "successful" }),
      Referral.countDocuments({ referrer: req.user._id, status: "pending" }),
      Referral.aggregate([
        { $match: { referrer: req.user._id, status: "successful" } },
        { $group: { _id: null, total: { $sum: "$rewardAmount" } } },
      ]),
    ]);
    return res.json({ success: true, data: { code: req.user.referralCode, total, successful, pending, eligibleRewards: rewards[0]?.total || 0 } });
  } catch (error) {
    return next(error);
  }
});

router.get("/my-code", (req, res) => res.json({ success: true, data: { code: req.user.referralCode } }));

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const filter = { referrer: req.user._id };
    const [items, total] = await Promise.all([
      Referral.find(filter).select("-referredUser").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Referral.countDocuments(filter),
    ]);
    return res.json({ success: true, data: { items, page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = await Referral.findOne({ _id: req.params.id, referrer: req.user._id }).select("-referredUser").lean();
    if (!item) return res.status(404).json({ success: false, message: "Referral not found" });
    return res.json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
