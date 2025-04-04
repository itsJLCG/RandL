const Product = require('../models/Product');

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, category, image } = req.body;
    
    // Validate image data
    if (!image || !image.public_id || !image.url) {
      return res.status(400).json({
        success: false,
        error: 'Product image information is required'
      });
    }

    const product = await Product.create({
      name,
      price,
      description,
      category,
      image: {
        public_id: image.public_id,
        url: image.url
      }
    });

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};


// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, description, category, image } = req.body;
    console.log('Received update data:', { name, price, description, category, image });

    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Create update object with existing image as default
    const updateData = {
      name,
      price,
      description,
      category,
      image: product.image // Keep existing image by default
    };

    // Update image only if new image data is provided
    if (image && image.public_id && image.url) {
      updateData.image = {
        public_id: image.public_id,
        url: image.url
      };
    }

    console.log('Updating product with data:', updateData);

    product = await Product.findByIdAndUpdate(
      req.params.id, 
      updateData,
      { new: true, runValidators: true }
    ).populate('category');

    console.log('Updated product:', product);

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};