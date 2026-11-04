const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 300 },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    icon: { type: String, default: "trophy", trim: true, maxlength: 40 },
    target: { type: Number, min: 1, default: 1 },
    rewardXp: { type: Number, min: 0, default: 0 },
    rewardType: { type: String, enum: ["ve", "sve", "gems", "tokens", "xp"], default: "xp" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

achievementSchema.index({ active: 1, category: 1 });

module.exports = mongoose.model("Achievement", achievementSchema);
