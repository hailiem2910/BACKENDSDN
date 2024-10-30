// const mongoose = require("mongoose");

// const transactionSchema = new mongoose.Schema(
//   {
//     user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     toy_id: { type: mongoose.Schema.Types.ObjectId, ref: "Toy" },
//     transaction_type: { type: String, enum: ["rent", "sale"], required: true },
//     amount: { type: Number, required: true },
//     date: { type: Date, default: Date.now },
//     status: {
//       type: String,
//       enum: ["completed", "pending"],
//       default: "completed",
//     },
//     duration: { type: String },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Transaction", transactionSchema);
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toy_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Toy",
      required: true,
    },
    transaction_type: { type: String, enum: ["rent", "sale"], required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["completed", "pending"],
      default: "completed",
    },
    duration: { type: String }, // E.g., '1 week', '2 weeks'
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
