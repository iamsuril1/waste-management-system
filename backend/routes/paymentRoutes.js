const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { createPaymentIntent } = require("../controllers/paymentController");

const router = express.Router();

router.post("/intent", authMiddleware, createPaymentIntent);
module.exports = router;
