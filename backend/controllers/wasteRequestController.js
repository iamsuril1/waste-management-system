const mongoose = require("mongoose");
const WasteRequest = require("../models/WasteRequest");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.createRequest = async (req, res) => {
  try {
    const { address, pickupDate, wasteType, quantityKg, notes } = req.body;
    if (!address || !pickupDate || !wasteType || quantityKg == null)
      return res.status(400).json({ message: "address, pickupDate, wasteType, quantityKg required" });

    const doc = await WasteRequest.create({
      user: req.user.id, address, pickupDate, wasteType, quantityKg, notes
    });

    res.status(201).json({ message: "Request created", request: doc });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getMyRequests = async (req, res) => {
  try {
    const { status, wasteType, from, to, page = 1, limit = 10 } = req.query;
    const q = { user: req.user.id };
    if (status) q.status = status;
    if (wasteType) q.wasteType = wasteType;
    if (from || to) q.pickupDate = {};
    if (from) q.pickupDate.$gte = new Date(from);
    if (to) q.pickupDate.$lte = new Date(to);

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      WasteRequest.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      WasteRequest.countDocuments(q)
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getAllRequests = async (req, res) => {
  try {
    const { status, wasteType, user, from, to, page = 1, limit = 10 } = req.query;
    const q = {};
    if (status) q.status = status;
    if (wasteType) q.wasteType = wasteType;
    if (user && isValidId(user)) q.user = user;
    if (from || to) q.pickupDate = {};
    if (from) q.pickupDate.$gte = new Date(from);
    if (to) q.pickupDate.$lte = new Date(to);

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      WasteRequest.find(q).populate("user", "name email role").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      WasteRequest.countDocuments(q)
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getRequestById = async (req, res) => {
  try {
    const doc = await WasteRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    const isOwner = doc.user.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });
    res.json(doc);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateMyRequest = async (req, res) => {
  try {
    const doc = await WasteRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    if (doc.user.toString() !== req.user.id) return res.status(403).json({ message: "Forbidden" });
    if (!["pending", "scheduled"].includes(doc.status))
      return res.status(400).json({ message: `Cannot edit when status is ${doc.status}` });

    const editable = ["address","pickupDate","wasteType","quantityKg","notes"];
    editable.forEach(k => { if (req.body[k] !== undefined) doc[k] = req.body[k]; });
    await doc.save();
    res.json({ message: "Updated", request: doc });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.cancelMyRequest = async (req, res) => {
  try {
    const doc = await WasteRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    if (doc.user.toString() !== req.user.id) return res.status(403).json({ message: "Forbidden" });
    if (["collected", "cancelled"].includes(doc.status))
      return res.status(400).json({ message: `Cannot cancel when status is ${doc.status}` });

    doc.status = "cancelled";
    await doc.save();
    res.json({ message: "Cancelled", request: doc });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.adminUpdateStatus = async (req, res) => {
  try {
    const doc = await WasteRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    const { status, assignedTo } = req.body;
    const allowed = ["pending", "scheduled", "collected", "cancelled"];
    if (status && !allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });
    if (status) doc.status = status;
    if (assignedTo !== undefined) doc.assignedTo = assignedTo;
    await doc.save();
    res.json({ message: "Updated", request: doc });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.deleteRequest = async (req, res) => {
  try {
    const doc = await WasteRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    const isOwner = doc.user.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (isAdmin || (isOwner && doc.status === "pending")) {
      await doc.deleteOne();
      return res.json({ message: "Deleted" });
    }
    res.status(403).json({ message: "Forbidden" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
