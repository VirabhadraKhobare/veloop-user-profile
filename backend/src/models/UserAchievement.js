const mongoose = require("mongoose");

const userAchievementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    achievement: { type: mongoose.Schema.Types.ObjectId, ref: "Achievement", required: true },
    progress: { type: Number, min: 0, default: 0 },
    unlockedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

module.exports = mongoose.model("UserAchievement", userAchievementSchema);
