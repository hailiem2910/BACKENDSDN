const express = require("express");
const ShoppingCart = require("../models/ShoppingCart");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all items in the user's cart
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cart = await ShoppingCart.findOne({ user: req.user._id }).populate(
      "items.toy"
    );
    res.json(cart || { message: "Shopping cart is empty" });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shopping cart", error });
  }
});

// Add an item to the cart
router.post("/", authMiddleware, async (req, res) => {
  const { toyId, rent_duration, quantity } = req.body;

  try {
    let cart = await ShoppingCart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new ShoppingCart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.toy.toString() === toyId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.rent_duration = rent_duration;
    } else {
      cart.items.push({ toy: toyId, rent_duration, quantity });
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Failed to add item to cart", error });
  }
});

// Remove an item from the cart
router.delete("/:itemId", authMiddleware, async (req, res) => {
  try {
    const cart = await ShoppingCart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Shopping cart not found" });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.remove();
    await cart.save();
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove item from cart", error });
  }
});

module.exports = router;
