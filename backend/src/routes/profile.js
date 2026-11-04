const express = require("express");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const RewardTransaction = require("../models/RewardTransaction");
const Achievement = require("../models/Achievement");
const UserAchievement = require("../models/UserAchievement");
const Referral = require("../models/Referral");
const Withdrawal = require("../models/Withdrawal");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function getLevelProgress(xp) {
  const currentLevel = Math.floor(xp / 1000) + 1;
  const currentLevelXp = (currentLevel - 1) * 1000;
  const nextLevelXp = currentLevel * 1000;
  const progress = xp - currentLevelXp;

  return {
    currentLevel,
    currentLevelName: `Reward Level ${String(currentLevel).padStart(2, "0")}`,
    nextLevel: currentLevel + 1,
    currentXp: xp,
    nextLevelXp,
    xpRemaining: Math.max(nextLevelXp - xp, 0),
    progressPercent: Math.min(Math.round((progress / 1000) * 100), 100),
  };
}

router.get("/me", async (req, res, next) => {
  try {
    const [user, wallet, achievements, unlockedAchievements, referrals, withdrawals, rewards] =
      await Promise.all([
        User.findById(req.user._id).lean(),
        Wallet.findOne({ user: req.user._id }).lean(),
        Achievement.find({ active: true }).sort({ category: 1, createdAt: 1 }).lean(),
        UserAchievement.find({ user: req.user._id }).populate("achievement").lean(),
        Referral.find({ referrer: req.user._id }).sort({ createdAt: -1 }).lean(),
        Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 }).lean(),
        RewardTransaction.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10).lean(),
      ]);

    const balances = {
      ve: wallet?.ve || 0,
      sve: wallet?.sve || 0,
      gems: wallet?.gems || 0,
      tokens: wallet?.tokens || 0,
      xp: wallet?.xp || 0,
    };
    const levelProgress = getLevelProgress(balances.xp);
    const activity = [
      ...rewards.map((item) => ({
        id: item._id,
        type: "reward",
        description: item.description,
        amount: item.amount,
        asset: item.type,
        status: item.status,
        createdAt: item.createdAt,
      })),
      ...withdrawals.map((item) => ({
        id: item._id,
        type: "withdrawal",
        description: `Withdrawal ${item.referenceId}`,
        amount: item.amount,
        asset: "tokens",
        status: item.status,
        createdAt: item.createdAt,
      })),
    ]
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .slice(0, 10);

    const successfulReferrals = referrals.filter((item) => item.status === "successful").length;
    const pendingReferrals = referrals.filter((item) => item.status === "pending").length;
    const completedWithdrawals = withdrawals.filter((item) => item.status === "completed");
    const unlocked = unlockedAchievements.filter((item) => item.unlockedAt);

    return res.json({
      success: true,
      data: {
        profile: {
          id: user._id,
          userId: user._id.toString(),
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          referralCode: user.referralCode,
          status: user.status,
          role: user.role,
          memberSince: user.memberSince,
        },
        rewards: balances,
        levelProgress,
        achievements: {
          total: achievements.length,
          unlocked: unlocked.length,
          items: achievements.map((achievement) => ({
            ...achievement,
            progress: unlockedAchievements.find(
              (item) => item.achievement?._id.toString() === achievement._id.toString(),
            ) || null,
          })),
        },
        referrals: {
          code: user.referralCode,
          total: referrals.length,
          successful: successfulReferrals,
          pending: pendingReferrals,
          rewardsEarned: referrals
            .filter((item) => item.status === "successful")
            .reduce((total, item) => total + item.rewardAmount, 0),
        },
        withdrawals: {
          pending: withdrawals.filter((item) =>
            ["pending", "approved", "processing"].includes(item.status),
          ).length,
          completed: completedWithdrawals.length,
          totalWithdrawn: completedWithdrawals.reduce((total, item) => total + item.amount, 0),
        },
        activity,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
