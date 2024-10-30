const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  toy: { type: mongoose.Schema.Types.ObjectId, ref: "Toy", required: true },
  rent_duration: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    status: { type: String, default: "Pending" }, // Order status
    totalAmount: { type: Number, required: true }, // Total amount for the order
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
