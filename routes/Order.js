const express = require("express");
const ShoppingCart = require("../models/ShoppingCart");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Đặt hàng
router.post("/", authMiddleware, async (req, res) => {
  // Log toàn bộ request body để debug
  console.log('Received type in request:', req.body.type);
  
  const { shippingAddress, type, transaction_type } = req.body;

  try {
    const cart = await ShoppingCart.findOne({ user: req.user._id }).populate(
      "items.toy"
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng của bạn trống" });
    }

    let totalAmount = 0;
    for (const item of cart.items) {
      const pricePerItem = item.toy.price[item.rent_duration];
      if (pricePerItem === undefined) {
        return res.status(400).json({
          message: `Không có giá cho thời gian thuê ${item.rent_duration} của đồ chơi ${item.toy._id}`,
        });
      }
      const amount = pricePerItem * item.quantity;
      totalAmount += amount;

      const transaction = new Transaction({
        user_id: req.user._id,
        toy_id: item.toy._id,
        transaction_type: transaction_type || "rent",
        amount,
        status: "completed",
        duration: item.rent_duration,
      });
      await transaction.save();
    }

    // Tạo order với type được chỉ định rõ ràng
    const orderData = {
      user: req.user._id,
      items: cart.items.map((item) => ({
        toy: item.toy._id,
        rent_duration: item.rent_duration,
        quantity: item.quantity,
      })),
      shippingAddress,
      totalAmount,
      type: type || 'default', // Đảm bảo type luôn có giá trị
      status: "Pending"
    };

    console.log('Order data before creation:', orderData);

    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();

    console.log('Saved order:', savedOrder);

    // Xóa giỏ hàng
    await ShoppingCart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json({
      message: "Đặt hàng thành công",
      order: savedOrder
    });
  } catch (error) {
    console.error("Không thể đặt hàng:", error);
    res.status(500).json({
      message: "Không thể đặt hàng",
      error: error.message
    });
  }
});

router.get("/all", authMiddleware, async (req, res) => {
  // Ensure only staff can access this route
  if (req.user.role !== "staff") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const orders = await Order.find()
      .populate({
        path: "user",
        select: "username" // Chỉ lấy username vì frontend chỉ hiển thị mỗi username
      })
      .populate({
        path: "items.toy",
        select: "name price" // Chỉ lấy name và price của toy
      })
      .select({
        status: 1,
        totalAmount: 1,
        shippingAddress: 1,
        items: 1
      });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
});

// PUT approve order
router.put("/:orderId/approve", authMiddleware, async (req, res) => {
  // Check if user has "staff" role
  if (req.user.role !== "staff") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status from Pending to approved
    if (order.status === "Pending") {
      order.status = "approved";
      await order.save();

      // Return the updated order with minimal required fields
      const updatedOrder = await Order.findById(req.params.orderId)
        .populate({
          path: "user",
          select: "username"
        })
        .populate({
          path: "items.toy",
          select: "name price"
        })
        .select({
          status: 1,
          totalAmount: 1,
          shippingAddress: 1,
          items: 1
        });

      res.status(200).json(updatedOrder);
    } else {
      res.status(400).json({ message: "Order cannot be approved" });
    }
  } catch (error) {
    console.error("Failed to approve order:", error);
    res.status(500).json({ message: "Failed to approve order", error });
  }
});


module.exports = router;