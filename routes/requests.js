const express = require("express");
const Request = require("../models/Request");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a request
router.post("/", authMiddleware, async (req, res) => {
  const { toy_id, type, rent_duration, price } = req.body;
  const newRequest = new Request({
    toy_id,
    user_id: req.user._id,
    type,
    rent_duration,
    price,
  });
  await newRequest.save();
  res.status(201).json(newRequest);
});

// Get all requests
router.get("/", authMiddleware, async (req, res) => {
  const requests = await Request.find().populate("user_id").populate("toy_id");
  res.json(requests);
});

// Get a request by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("user_id")
      .populate("toy_id");
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update a request
router.put("/:id", authMiddleware, async (req, res) => {
  const updatedRequest = await Request.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updatedRequest);
});

// Delete a request
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedRequest = await Request.findByIdAndDelete(req.params.id);
    if (!deletedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
