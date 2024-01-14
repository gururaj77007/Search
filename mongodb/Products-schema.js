const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  price: {
    type: Number,
  },
  discount: {
    type: Number,
  },
});

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  basevariant: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    default: 0, // Default discount value is 0
  },
  houseId: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  imageUrl: {
    type: [String], // Make imageUrl an array of strings
  },
  discountPercentage: {
    type: Number,
  },
  Description: {
    type: String,
  },
  unit: {
    type: String,
  },
  variants: [variantSchema],
  nameEmbedding: {
    type: [Number],
  },
});

// Virtual field for calculating discounted price

// Apply the pagination plugin to your schema
productSchema.plugin(mongoosePaginate);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
