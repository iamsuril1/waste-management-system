const mongoose = require("mongoose");

const wasteTypes = ["organic", "recyclable", "hazardous", "e-waste", "bulk", "mixed"];
const statusTypes = ["pending", "scheduled", "collected", "cancelled"];

const wasteRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    address: { type: String, required: true, trim: true },
    pickupDate: { type: Date, required: true },
    wasteType: { type: String, enum: wasteTypes, required: true },
    quantityKg: { type: Number, min: 0, required: true },
    notes: { type: String, default: "" },
    status: { type: String, enum: statusTypes, default: "pending" },
    assignedTo: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("WasteRequest", wasteRequestSchema);
