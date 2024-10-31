const express = require("express");
const Toy = require("../models/Toy");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all toys
router.get("/", async (req, res) => {
  try {
    const toys = await Toy.find({});
    // Kiểm tra nếu không có món đồ chơi nào được tìm thấy
    if (!toys || toys.length === 0) {
      return res.status(404).json({ message: "No toys found" });
    }
    res.status(200).json(toys);
  } catch (error) {
    console.error("Failed to fetch toys:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch toys", error: error.message });
  }
});

// Create a toy (Supplier only)
router.post("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "supplier") {
    return res.status(403).send("Access denied");
  }

  const {
    name,
    category,
    description,
    price,
    availability,
    is_rentable,
    is_saleable,
    inventory_count,
    imageUrl,
    fixedPrice
  } = req.body;

  try {
    const toyData = {
      name,
      category,
      description,
      price,
      availability,
      is_rentable,
      is_saleable,
      supplier_id: req.user._id,
      inventory_count,
      imageUrl
    };

    // Only add fixedPrice if it exists and is_saleable is true
    if (is_saleable && fixedPrice) {
      toyData.fixedPrice = fixedPrice;
    }

    const newToy = new Toy(toyData);
    await newToy.save();
    res.status(201).json(newToy);
  } catch (error) {
    console.error('Error creating toy:', error);
    res.status(400).json({ 
      message: "Failed to create toy", 
      error: error.message 
    });
  }
});

// Update a toy
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedToy = await Toy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedToy) {
      return res.status(404).json({ message: "Toy not found" });
    }
    res.json(updatedToy);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Failed to update toy", error });
  } 
});

// Delete a toy
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const toyId = req.params.id.trim(); // Thêm trim() nếu cần
    const deletedToy = await Toy.findByIdAndDelete(toyId);
    if (!deletedToy) {
      return res.status(404).json({ message: "Toy not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Failed to delete toy", error });
  }
});

// Get a toy by ID
router.get("/:id", async (req, res) => {
  try {
    const toyId = req.params.id.trim(); // Use trim() if there might be whitespace
    const toy = await Toy.findById(toyId);

    // Check if the toy was found
    if (!toy) {
      return res.status(404).json({ message: "Toy not found" });
    }

    res.status(200).json(toy);
  } catch (error) {
    console.error("Failed to fetch toy by ID:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch toy", error: error.message });
  }
});
// Get unique categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Toy.distinct("category"); // Fetch unique categories
    res.status(200).json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// Get all feedback for a specific toy
router.get("/:id/feedback", async (req, res) => {
  try {
    const toy = await Toy.findById(req.params.id).populate(
      "feedback.user",
      "username"
    );
    if (!toy) {
      return res.status(404).json({ message: "Toy not found" });
    }
    res.status(200).json(toy.feedback);
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch feedback", error: error.message });
  }
});

// Add feedback to a toy
router.post("/:id/feedback", authMiddleware, async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const toy = await Toy.findById(req.params.id);
    if (!toy) {
      return res.status(404).json({ message: "Toy not found" });
    }

    // Add feedback to toy's feedback array
    toy.feedback.push({ user: req.user._id, rating, comment });

    // Update the average rating
    await toy.updateAverageRating();

    res
      .status(201)
      .json({ message: "Feedback added successfully", feedback: toy.feedback });
  } catch (error) {
    console.error("Failed to add feedback:", error);
    res
      .status(500)
      .json({ message: "Failed to add feedback", error: error.message });
  }
});
module.exports = router;
