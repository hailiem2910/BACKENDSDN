const express = require("express");
const ShoppingCart = require("../models/ShoppingCart");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Place an order
router.post("/", authMiddleware, async (req, res) => {
  const { shippingAddress, transaction_type } = req.body;

  try {
    const cart = await ShoppingCart.findOne({ user: req.user._id }).populate(
      "items.toy"
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // Calculate the total amount
    let totalAmount = 0;

    // Process each item in the cart as a separate transaction
    for (const item of cart.items) {
      const pricePerItem = item.toy.price[item.rent_duration];

      // Check if price exists for the specified rent duration
      if (pricePerItem === undefined) {
        return res.status(400).json({
          message: `Price not available for the duration ${item.rent_duration} for toy ${item.toy._id}`,
        });
      }

      const amount = pricePerItem * item.quantity;
      totalAmount += amount;

      // Save transaction history for each item
      const transaction = new Transaction({
        user_id: req.user._id,
        toy_id: item.toy._id,
        transaction_type: transaction_type || "rent", // Default to rent if not specified
        amount,
        status: "completed",
        duration: item.rent_duration,
      });

      await transaction.save();
    }

    // Save the order information including the total amount
    const newOrder = new Order({
      user: req.user._id,
      items: cart.items.map((item) => ({
        toy: item.toy._id,
        rent_duration: item.rent_duration,
        quantity: item.quantity,
      })),
      shippingAddress,
      totalAmount, // Add totalAmount to the order
    });
    await newOrder.save();

    // Clear the user's shopping cart after placing the order
    await ShoppingCart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Failed to place order:", error);
    res.status(500).json({ message: "Failed to place order", error });
  }
});

module.exports = router;
