const mongoose = require("mongoose");
const states = ["open", "reserved", "claimed", "cancelled", "closed"];

const giveawaySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    wasteType: { type: String, default: "mixed" },
    quantityKg: { type: Number, min: 0, required: true },
    location: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: states, default: "open" },
    claimer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    scheduledPickupDate: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Giveaway", giveawaySchema);
