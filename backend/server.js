require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas connection string (stored in .env)
const mongoURI = process.env.MONGO_URI;

// Connect to MongoDB Atlas
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Atlas connected'))
  .catch((error) => console.log('Error connecting to MongoDB Atlas:', error));

// Define Product Schema
const productSchema = new mongoose.Schema({
  barcode: { type: String, required: true, unique: true },
  title: String,
  description: String,
  category: String,
  manufacturer: String,
  brand: String,
  ingredients: String,
  images: [String],
});

const Product = mongoose.model('Product', productSchema);

// Route to get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products from DB
    res.json(products); // Send products back as JSON
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error'); // Handle error
  }
});

// Route to update a product by its ID
app.put('/api/products/:id', async (req, res) => {
  const { title, description, category, manufacturer, brand, ingredients, images, quantity, price } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { title, description, category, manufacturer, brand, ingredients, images, quantity, price },
      { new: true } // Return the updated product
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct); // Send the updated product back
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Route to delete a product by its ID
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id); // Find and delete product by ID
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Route to add a product (POST)
app.post('/api/products', async (req, res) => {
  const { barcode } = req.body; // Assume barcode data is sent in the request body

  try {
    // Make API call to Barcode Lookup API with barcode
    const apiKey = process.env.API_KEY; // Fetch API key from .env
    const response = await axios.get(`https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=${apiKey}`);

    // Extract relevant product data from the response
    const productDetails = response.data.products[0];

    if (!productDetails) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { product_name: title, description, category, manufacturer, brand, ingredients, image_url: images } = productDetails;

    // Create a new product with the fetched data
    const newProduct = new Product({
      barcode,
      title,
      description,
      category,
      manufacturer,
      brand,
      ingredients,
      images: Array.isArray(images) ? images : [images], // Ensure images are an array
    });

    await newProduct.save(); // Save the new product to the database
    res.json(newProduct); // Return the saved product
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).json({ message: 'Error fetching product details' });
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
