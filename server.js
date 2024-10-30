const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config(); // Đảm bảo dòng này có mặt

// Log để kiểm tra giá trị MONGO_URI
console.log("MongoDB URI:", process.env.MONGO_URI); // Sửa lại đây

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/toys", require("./routes/toys"));
app.use("/api/requests", require("./routes/requests"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/chats", require("./routes/chats"));
app.use("/api/shopping-cart", require("./routes/shoppingcart"));
app.use("/api/checkout", require("./routes/Order"));
// Start server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Kiểm tra tất cả các biến môi trường
// console.log(process.env);
