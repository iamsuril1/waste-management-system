const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "Profile", user: req.user });
});

router.get("/admin", authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

module.exports = router;
