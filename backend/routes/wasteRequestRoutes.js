const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  updateMyRequest,
  cancelMyRequest,
  adminUpdateStatus,
  deleteRequest
} = require("../controllers/wasteRequestController");

const router = express.Router();

router.post("/", authMiddleware, createRequest);
router.get("/my", authMiddleware, getMyRequests);
router.get("/:id", authMiddleware, getRequestById);
router.patch("/:id", authMiddleware, updateMyRequest);
router.patch("/:id/cancel", authMiddleware, cancelMyRequest);
router.delete("/:id", authMiddleware, deleteRequest);

router.get("/", authMiddleware, adminMiddleware, getAllRequests);
router.patch("/:id/status", authMiddleware, adminMiddleware, adminUpdateStatus);

module.exports = router;
