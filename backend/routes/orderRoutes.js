const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { createOrder, getMyOrders, markFulfilled, cancelOrder } = require("../controllers/orderController");

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/my", authMiddleware, getMyOrders);
router.patch("/:id/fulfilled", authMiddleware, markFulfilled);
router.patch("/:id/cancel", authMiddleware, cancelOrder);

module.exports = router;
