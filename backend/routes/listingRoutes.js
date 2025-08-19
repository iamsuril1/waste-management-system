const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { createListing, listListings, getListing, updateListing, closeListing } = require("../controllers/listingController");

const router = express.Router();

router.get("/", listListings);
router.get("/:id", getListing);
router.post("/", authMiddleware, createListing);
router.patch("/:id", authMiddleware, updateListing);
router.patch("/:id/close", authMiddleware, closeListing);

module.exports = router;
