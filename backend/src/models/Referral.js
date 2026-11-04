const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    referredUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    status: { type: String, enum: ["pending", "successful", "rejected"], default: "pending" },
    rewardAmount: { type: Number, min: 0, default: 0 },
    rewardType: { type: String, enum: ["ve", "sve", "gems", "tokens"], default: "ve" },
    rewardAwardedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

referralSchema.index({ referrer: 1, createdAt: -1 });

module.exports = mongoose.model("Referral", referralSchema);
