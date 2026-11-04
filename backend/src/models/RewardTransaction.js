const mongoose = require("mongoose");

const rewardTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["ve", "sve", "gems", "tokens", "xp"], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
    description: { type: String, required: true, trim: true, maxlength: 300 },
    source: { type: String, trim: true, maxlength: 100 },
    idempotencyKey: { type: String, trim: true },
  },
  { timestamps: true }
);

rewardTransactionSchema.index({ user: 1, createdAt: -1 });
rewardTransactionSchema.index({ user: 1, idempotencyKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("RewardTransaction", rewardTransactionSchema);
