const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { createPaymentIntent } = require("../controllers/paymentController");

const router = express.Router();

router.post("/intent", authMiddleware, createPaymentIntent);
// NOTE: webhook is mounted directly in server.js to get RAW body

module.exports = router;
