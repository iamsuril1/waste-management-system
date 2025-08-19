const Giveaway = require("../models/Giveaway");

exports.createGiveaway = async (req, res) => {
  try {
    const { title, description, wasteType, quantityKg, location } = req.body;
    if (!title || quantityKg == null || !location) return res.status(400).json({ message: "title, quantityKg, location required" });
    const doc = await Giveaway.create({ title, description, wasteType, quantityKg, location, createdBy: req.user.id });
    res.status(201).json({ message: "Giveaway created", giveaway: doc });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.listGiveaways = async (req, res) => {
  try {
    const { status = "open", page = 1, limit = 12 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Giveaway.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate("createdBy", "name email"),
      Giveaway.countDocuments(filter)
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.claimGiveaway = async (req, res) => {
  try {
    const g = await Giveaway.findById(req.params.id);
    if (!g) return res.status(404).json({ message: "Not found" });
    if (!["open", "reserved"].includes(g.status)) return res.status(400).json({ message: `Cannot claim in status ${g.status}` });

    if (g.status === "open") {
      g.status = "reserved";
      g.claimer = req.user.id;
      if (req.body.scheduledPickupDate) g.scheduledPickupDate = req.body.scheduledPickupDate;
      await g.save();
      return res.json({ message: "Reserved for you", giveaway: g });
    }

    if (g.claimer?.toString() !== req.user.id) return res.status(403).json({ message: "Reserved by someone else" });
    g.status = "claimed";
    if (req.body.scheduledPickupDate) g.scheduledPickupDate = req.body.scheduledPickupDate;
    await g.save();
    res.json({ message: "Claimed", giveaway: g });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateGiveawayStatus = async (req, res) => {
  try {
    const g = await Giveaway.findById(req.params.id);
    if (!g) return res.status(404).json({ message: "Not found" });
    const isOwner = g.createdBy.toString() === req.user.id;
    if (!isOwner && req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    const { status } = req.body;
    const allowed = ["open", "reserved", "claimed", "cancelled", "closed"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    g.status = status;
    await g.save();
    res.json({ message: "Updated", giveaway: g });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
