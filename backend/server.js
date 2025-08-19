const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// CORS
const allowedOrigins = (process.env.FRONTEND_URL || "").split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : "*", credentials: true }));

// Stripe webhook (RAW body) MUST be before express.json()
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), (req, res, next) => {
  req.rawBody = req.body; // Buffer
  const { webhook } = require("./controllers/paymentController");
  webhook(req, res, next);
});

// JSON parser for all other routes
app.use(express.json());

// Rate limit
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

// Health
app.get("/", (req, res) => res.send("Waste Management System Backend Running..."));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/requests", require("./routes/wasteRequestRoutes"));
app.use("/api/listings", require("./routes/listingRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/giveaways", require("./routes/giveawayRoutes"));

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
