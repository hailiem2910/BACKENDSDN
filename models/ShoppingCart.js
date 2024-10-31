const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    toy: { type: mongoose.Schema.Types.ObjectId, ref: "Toy", required: true },
    rent_duration: { type: String, required: true }, // e.g., 'day', 'week', 'twoWeeks'
    quantity: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
);

// Thêm method remove vào cartItemSchema
cartItemSchema.methods.removeFromCart = function() {
  // Lấy document cha (shopping cart)
  const cart = this.parent();
  // Xóa item này khỏi mảng items
  cart.items.pull(this._id);
  // Trả về promise của operation save
  return cart.save();
};

const shoppingCartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [cartItemSchema], // Array of items in the cart
  },
  { timestamps: true }
);

shoppingCartSchema.pre('save', function(next) {
  if (this.items.length === 0) {
    this.items = [];  // Ensure empty array is properly set
  }
  next();
});

module.exports = mongoose.model("ShoppingCart", shoppingCartSchema);
