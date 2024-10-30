const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

const toySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    price: {
      day: { type: Number, required: true },
      week: { type: Number, required: true },
      twoWeeks: { type: Number, required: true },
    },
    availability: { type: Boolean, default: true },
    is_rentable: { type: Boolean, default: true },
    is_saleable: { type: Boolean, default: true },
    supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    inventory_count: { type: Number, default: 0 },
    feedback: [feedbackSchema], // Array of feedback objects
    averageRating: { type: Number, default: 0 }, // Average rating field
  },
  { timestamps: true }
);

// Method to update the average rating
toySchema.methods.updateAverageRating = function () {
  if (this.feedback.length > 0) {
    const total = this.feedback.reduce((sum, f) => sum + f.rating, 0);
    this.averageRating = total / this.feedback.length;
  } else {
    this.averageRating = 0;
  }
  return this.save();
};

module.exports = mongoose.model("Toy", toySchema);
