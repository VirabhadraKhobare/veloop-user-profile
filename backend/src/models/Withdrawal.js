const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    payoutMethod: { type: String, required: true, trim: true, maxlength: 40 },
    payoutDetails: { type: String, required: true, trim: true, maxlength: 300 },
    status: {
      type: String,
      enum: ["pending", "approved", "processing", "completed", "rejected"],
      default: "pending",
    },
    referenceId: { type: String, unique: true, index: true },
    rejectionReason: { type: String, trim: true, maxlength: 300, default: "" },
    statusHistory: [
      {
        status: String,
        reason: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

withdrawalSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Withdrawal", withdrawalSchema);
