const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  barcode: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  manufacturer: { type: String, required: true },
  brand: { type: String, required: true },
  ingredients: { type: String, required: true },
  images: [String],
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
