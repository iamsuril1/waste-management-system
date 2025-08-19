const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");

exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: "orderId required" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.buyer.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Only buyer can pay" });

    if (order.status !== "payment_required")
      return res.status(400).json({ message: "Order not payable" });

    const amountInCents = Math.round(order.totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: order.currency,
      metadata: { orderId: order._id.toString() },
      automatic_payment_methods: { enabled: true }
    });

    await Transaction.create({
      order: order._id,
      provider: "stripe",
      paymentIntentId: paymentIntent.id,
      amount: order.totalAmount,
      currency: order.currency,
      status: paymentIntent.status
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// Stripe Webhook (expects raw body, set in server.js)
exports.webhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type.startsWith("payment_intent.")) {
      const pi = event.data.object;
      const tx = await Transaction.findOne({ paymentIntentId: pi.id }).populate("order");
      if (tx) {
        tx.status = pi.status;
        await tx.save();

        if (tx.order) {
          if (pi.status === "succeeded") tx.order.status = "paid";
          else if (pi.status === "canceled") tx.order.status = "cancelled";
          else if (pi.status === "processing") tx.order.status = "pending";
          await tx.order.save();
        }
      }
    }

    res.json({ received: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
