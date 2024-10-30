const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    toy: { type: mongoose.Schema.Types.ObjectId, ref: "Toy", required: true },
    rent_duration: { type: String, required: true }, // e.g., 'day', 'week', 'twoWeeks'
    quantity: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
);

const shoppingCartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [cartItemSchema], // Array of items in the cart
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShoppingCart", shoppingCartSchema);
