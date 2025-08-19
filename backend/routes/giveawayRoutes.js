const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { createGiveaway, listGiveaways, claimGiveaway, updateGiveawayStatus } = require("../controllers/giveawayController");

const router = express.Router();

router.get("/", listGiveaways);
router.post("/", authMiddleware, createGiveaway);
router.post("/:id/claim", authMiddleware, claimGiveaway);
router.patch("/:id/status", authMiddleware, updateGiveawayStatus);

module.exports = router;
