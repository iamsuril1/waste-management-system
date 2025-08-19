const mongoose = require("mongoose");
const directions = ["sell", "buy"];
const statuses = ["active", "paused", "closed"];

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    direction: { type: String, enum: directions, required: true }, // sell OR buy
    wasteType: { type: String, default: "mixed" },
    quantityKg: { type: Number, min: 0, required: true },
    unitPrice: { type: Number, min: 0, required: true }, // per KG
    location: { type: String, required: true },
    images: [{ type: String }],
    status: { type: String, enum: statuses, default: "active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", listingSchema);
