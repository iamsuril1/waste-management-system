const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to your profile", user: req.user });
});

// Admin-only
router.get("/admin", authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

module.exports = router;
