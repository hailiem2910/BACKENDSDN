const express = require("express");
const ShoppingCart = require("../models/ShoppingCart");
const authMiddleware = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

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
    if (!mongoose.Types.ObjectId.isValid(req.params.itemId)) {
      return res.status(400).json({ message: "Invalid item ID format" });
    }
    const cart = await ShoppingCart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Shopping cart not found" });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // item.remove();
    // await cart.save();
    console.log('Before removal:', {
      cartId: cart._id,
      itemId: req.params.itemId,
      itemsCount: cart.items.length
    });
    
    await item.removeFromCart();
    
    console.log('After removal:', {
      cartId: cart._id,
      itemsCount: cart.items.length
    });
    res.json({ 
      success: true,
      message: "Item removed from cart successfully",
      removedItemId: req.params.itemId
    });

  } catch (error) {
    console.error('Cart removal error:', {
      error: error.message,
      stack: error.stack,
      itemId: req.params.itemId
    });
    
    res.status(500).json({ 
      success: false,
      message: "Failed to remove item from cart", 
      error: error.message 
    });
  }
});

module.exports = router;
