// const express = require("express");
// const Transaction = require("../models/Transaction");
// const authMiddleware = require("../middleware/authMiddleware");

// const router = express.Router();

// // Create a transaction
// router.post("/", authMiddleware, async (req, res) => {
//   const { toy_id, transaction_type, amount } = req.body;
//   const newTransaction = new Transaction({
//     user_id: req.user._id,
//     toy_id,
//     transaction_type,
//     amount,
//   });
//   await newTransaction.save();
//   res.status(201).json(newTransaction);
// });

// // Get all transactions
// router.get("/", authMiddleware, async (req, res) => {
//   const transactions = await Transaction.find()
//     .populate("user_id")
//     .populate("toy_id");
//   res.json(transactions);
// });

// module.exports = router;
const express = require("express");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a transaction
router.post("/", authMiddleware, async (req, res) => {
  const { toy_id, transaction_type, amount, duration } = req.body;

  try {
    // Validate transaction type
    if (!["rent", "sale"].includes(transaction_type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    const newTransaction = new Transaction({
      user_id: req.user._id,
      toy_id,
      transaction_type,
      amount,
      duration,
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error("Failed to create transaction:", error);
    res
      .status(500)
      .json({ message: "Failed to create transaction", error: error.message });
  }
});

// Get all transactions for the authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user_id: req.user._id })
      .populate("user_id", "username email") // Select only necessary fields
      .populate("toy_id", "name category price");

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch transactions", error: error.message });
  }
});

module.exports = router;
