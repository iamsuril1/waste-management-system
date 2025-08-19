const Listing = require("../models/Listing");

exports.createListing = async (req, res) => {
  try {
    const { title, description, direction, wasteType, quantityKg, unitPrice, location, images = [] } = req.body;
    if (!title || !direction || quantityKg == null || unitPrice == null || !location)
      return res.status(400).json({ message: "title, direction, quantityKg, unitPrice, location required" });

    const doc = await Listing.create({
      title, description, direction, wasteType, quantityKg, unitPrice, location, images, createdBy: req.user.id
    });
    res.status(201).json({ message: "Listing created", listing: doc });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.listListings = async (req, res) => {
  try {
    const { direction, wasteType, status = "active", q, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (direction) filter.direction = direction;
    if (wasteType) filter.wasteType = wasteType;
    if (status) filter.status = status;
    if (q) filter.title = { $regex: q, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Listing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate("createdBy", "name email"),
      Listing.countDocuments(filter)
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getListing = async (req, res) => {
  try {
    const doc = await Listing.findById(req.params.id).populate("createdBy", "name email");
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateListing = async (req, res) => {
  try {
    const doc = await Listing.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    if (doc.createdBy.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const editable = ["title","description","wasteType","quantityKg","unitPrice","location","images","status"];
    editable.forEach(k => { if (req.body[k] !== undefined) doc[k] = req.body[k]; });
    await doc.save();
    res.json({ message: "Updated", listing: doc });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.closeListing = async (req, res) => {
  try {
    const doc = await Listing.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    if (doc.createdBy.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    doc.status = "closed";
    await doc.save();
    res.json({ message: "Closed", listing: doc });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
