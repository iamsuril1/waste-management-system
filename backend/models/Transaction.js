const mongoose = require("mongoose");

const txSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    provider: { type: String, default: "stripe" },
    paymentIntentId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: {
      type: String,
      enum: ["requires_payment_method","requires_confirmation","requires_action","processing","succeeded","canceled"],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", txSchema);
