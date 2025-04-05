const Promotion = require('../models/Promotion');
const { sendPromotionNotification } = require('../utils/notificationService');

// @desc    Create new promotion
// @route   POST /api/promotions
// @access  Private/Admin
exports.createPromotion = async (req, res) => {
  try {
    const { title, description, discountPercentage, products, isActive } = req.body;
    
    const promotion = await Promotion.create({
      title,
      description,
      discountPercentage,
      products,
      isActive: isActive !== undefined ? isActive : true
    });

    // Send notification if the promotion is active
    if (promotion.isActive) {
      sendPromotionNotification(promotion);
    }

    res.status(201).json({
      success: true,
      promotion
    });
  } catch (error) {
    console.error('Create Promotion Error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};


// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Private/Admin
exports.getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find()
      .populate('products', 'name price image')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: promotions.length,
      promotions
    });
  } catch (error) {
    console.error('Get Promotions Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single promotion
// @route   GET /api/promotions/:id
// @access  Private/Admin
exports.getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id)
      .populate('products', 'name price image');
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Promotion not found'
      });
    }
    
    res.status(200).json({
      success: true,
      promotion
    });
  } catch (error) {
    console.error('Get Promotion Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update promotion
// @route   PUT /api/promotions/:id
// @access  Private/Admin
exports.updatePromotion = async (req, res) => {
  try {
    let promotion = await Promotion.findById(req.params.id);
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Promotion not found'
      });
    }

    const wasActive = promotion.isActive;
    
    promotion = await Promotion.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true, runValidators: true }
    );

    // Send notification if promotion was not active before but is now
    if (!wasActive && promotion.isActive) {
      sendPromotionNotification(promotion);
    }

    res.status(200).json({
      success: true,
      promotion
    });
  } catch (error) {
    console.error('Update Promotion Error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete promotion
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Promotion not found'
      });
    }

    await promotion.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (error) {
    console.error('Delete Promotion Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get active promotions
// @route   GET /api/promotions/active
// @access  Public
exports.getActivePromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find({
      isActive: true
    })
      .populate('products', 'name price image')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: promotions.length,
      promotions
    });
  } catch (error) {
    console.error('Get Active Promotions Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};