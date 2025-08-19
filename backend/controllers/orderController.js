const Listing = require("../models/Listing");
const Order = require("../models/Order");

const calcTotals = (qty, unitPrice) => {
  const subtotal = qty * unitPrice;
  const fees = Math.round(subtotal * 0.02 * 100) / 100; // 2% fee
  const totalAmount = subtotal + fees;
  return { subtotal, fees, totalAmount };
};

exports.createOrder = async (req, res) => {
  try {
    const { listingId, quantityKg, scheduledPickupDate } = req.body;
    if (!listingId || quantityKg == null) return res.status(400).json({ message: "listingId, quantityKg required" });

    const listing = await Listing.findById(listingId);
    if (!listing || listing.status !== "active") return res.status(400).json({ message: "Listing not active" });

    let buyer, seller;
    if (listing.direction === "sell") {
      seller = listing.createdBy;
      buyer = req.user.id;
      if (buyer.toString() === seller.toString()) return res.status(400).json({ message: "Cannot buy your own listing" });
    } else {
      buyer = listing.createdBy;
      seller = req.user.id;
      if (buyer.toString() === seller.toString()) return res.status(400).json({ message: "Cannot fulfill your own buy request" });
    }

    const { subtotal, fees, totalAmount } = calcTotals(quantityKg, listing.unitPrice);

    const order = await Order.create({
      listing: listing._id,
      buyer,
      seller,
      direction: listing.direction,
      quantityKg,
      unitPrice: listing.unitPrice,
      subtotal,
      fees,
      totalAmount,
      currency: process.env.CURRENCY || "usd",
      status: "payment_required",
      scheduledPickupDate
    });

    res.status(201).json({ message: "Order created. Proceed to payment.", order });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getMyOrders = async (req, res) => {
  try {
    const { role = "all", status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (role === "buyer") filter.buyer = req.user.id;
    else if (role === "seller") filter.seller = req.user.id;
    else filter.$or = [{ buyer: req.user.id }, { seller: req.user.id }];
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
        .populate("listing", "title direction unitPrice")
        .populate("buyer", "name email")
        .populate("seller", "name email"),
      Order.countDocuments(filter)
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.markFulfilled = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Not found" });
    if (order.seller.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });
    if (order.status !== "paid") return res.status(400).json({ message: "Order must be paid first" });

    order.status = "fulfilled";
    await order.save();
    res.json({ message: "Order fulfilled", order });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Not found" });
    const isParty = [order.buyer.toString(), order.seller.toString()].includes(req.user.id) || req.user.role === "admin";
    if (!isParty) return res.status(403).json({ message: "Forbidden" });
    if (!["payment_required", "pending"].includes(order.status))
      return res.status(400).json({ message: `Cannot cancel when status is ${order.status}` });

    order.status = "cancelled";
    await order.save();
    res.json({ message: "Order cancelled", order });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
