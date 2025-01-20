const express = require('express');
const axios = require('axios');
const Product = require('../models/product');
const router = express.Router();

// Create a new product
router.post('/', async (req, res) => {
  const { barcode, quantity, price } = req.body;

  try {
    const response = await axios.get(`https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=${process.env.API_KEY}`);
    const productDetails = response.data.products[0];

    if (!productDetails) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { product_name: title, description, category, manufacturer, brand, ingredients, image_url: images } = productDetails;

    const newProduct = new Product({
      barcode,
      title,
      description,
      category,
      manufacturer,
      brand,
      ingredients,
      images: Array.isArray(images) ? images : [images],
      quantity,
      price
    });

    await newProduct.save();
    res.json(newProduct);

  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).json({ message: 'Error fetching product details or saving to database' });
  }
});

module.exports = router;
