const express = require("express");
const Achievement = require("../models/Achievement");
const UserAchievement = require("../models/UserAchievement");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const achievements = await Achievement.find({ active: true }).sort({ category: 1, createdAt: 1 }).lean();
    return res.json({ success: true, data: achievements });
  } catch (error) {
    return next(error);
  }
});

router.get("/my", async (req, res, next) => {
  try {
    const items = await UserAchievement.find({ user: req.user._id }).populate("achievement").lean();
    return res.json({ success: true, data: items });
  } catch (error) {
    return next(error);
  }
});

router.get("/summary", async (req, res, next) => {
  try {
    const [total, unlocked] = await Promise.all([
      Achievement.countDocuments({ active: true }),
      UserAchievement.countDocuments({ user: req.user._id, unlockedAt: { $ne: null } }),
    ]);
    return res.json({
      success: true,
      data: { total, unlocked, locked: Math.max(total - unlocked, 0), completionPercent: total ? Math.round((unlocked / total) * 100) : 0 },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const achievement = await Achievement.findOne({ _id: req.params.id, active: true }).lean();
    if (!achievement) return res.status(404).json({ success: false, message: "Achievement not found" });
    const progress = await UserAchievement.findOne({ user: req.user._id, achievement: achievement._id }).lean();
    return res.json({ success: true, data: { achievement, progress } });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
