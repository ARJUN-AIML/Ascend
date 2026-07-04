const Product = require('../models/Product');

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ user: req.user.id });
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { companyName, role, stipend, status, deadline, platform } = req.body;
    if (!companyName || !role || !deadline) {
      res.status(400);
      throw new Error('companyName, role, and deadline are required.');
    }
    const product = await Product.create({
      companyName,
      role,
      stipend,
      status,
      deadline,
      platform: platform || 'Direct',
      user: req.user.id,
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    // Make sure the logged in user matches the product user
    if (product.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }
    
    const { companyName, role, stipend, status, deadline, platform } = req.body;
    product = await Product.findByIdAndUpdate(
      req.params.id,
      { companyName, role, stipend, status, deadline, platform },
      { new: true, runValidators: true }
    );
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    // Make sure the logged in user matches the product user
    if (product.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };