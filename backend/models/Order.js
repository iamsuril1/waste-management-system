const mongoose = require("mongoose");
const orderStatuses = ["pending", "payment_required", "paid", "cancelled", "fulfilled", "refunded"];

const orderSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    direction: { type: String, enum: ["sell", "buy"], required: true },
    quantityKg: { type: Number, min: 0, required: true },
    unitPrice: { type: Number, min: 0, required: true },
    subtotal: { type: Number, min: 0, required: true },
    fees: { type: Number, min: 0, default: 0 },
    totalAmount: { type: Number, min: 0, required: true },
    currency: { type: String, default: process.env.CURRENCY || "usd" },
    status: { type: String, enum: orderStatuses, default: "pending" },
    scheduledPickupDate: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
