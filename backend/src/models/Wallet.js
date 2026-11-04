const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    ve: { type: Number, min: 0, default: 0 },
    sve: { type: Number, min: 0, default: 0 },
    gems: { type: Number, min: 0, default: 0 },
    tokens: { type: Number, min: 0, default: 0 },
    xp: { type: Number, min: 0, default: 0 },
    reservedWithdrawal: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", walletSchema);
