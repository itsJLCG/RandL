const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      total
    } = req.body;
    
    console.log('Creating order with items:', JSON.stringify(orderItems));

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No order items provided'
      });
    }

    // Validate shipping address - all fields must be present
    const requiredAddressFields = ['name', 'street', 'city', 'state', 'zip', 'country', 'phone'];
    for (const field of requiredAddressFields) {
      if (!shippingAddress || !shippingAddress[field]) {
        return res.status(400).json({
          success: false,
          error: `Shipping address missing required field: ${field}`
        });
      }
    }

    // Create order
    const order = new Order({
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      subtotal: Number(subtotal),
      shippingCost: Number(shippingCost),
      tax: Number(tax),
      total: Number(total),
      status: 'Processing'
    });

    // Handle immediate payment methods (in a real app, you'd integrate payment processing)
    if (paymentMethod !== 'Cash on Delivery') {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: `PAYMENT-${Date.now()}`,
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: req.user.email
      };
    }

    const createdOrder = await order.save();
    
    // Add order to user's orders array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { orders: createdOrder._id }
    });

    res.status(201).json({
      success: true,
      order: createdOrder
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// @desc    Get all orders for the current user
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    // For admin, get all orders, for regular users get only their own
    const filter = req.user.role === 'admin' ? {} : { user: req.user.id };
    
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 }) // Most recent first
      .populate('user', 'name email');
    
    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    // Ensure user can only access their own orders (unless admin)
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this order'
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get Order Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    // Check if user is authorized (admin or order owner)
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this order'
      });
    }
    
    // Check if order can be cancelled (not delivered yet)
    if (order.isDelivered) {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel an order that has been delivered'
      });
    }
    
    order.status = 'Cancelled';
    const updatedOrder = await order.save();
    
    res.status(200).json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Cancel Order Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a status'
      });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    order.status = status;
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    const updatedOrder = await order.save();
    
    res.status(200).json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentResult } = req.body;

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = paymentResult || {
      id: Date.now().toString(),
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: req.user.email
    };
    
    const updatedOrder = await order.save();
    
    res.status(200).json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update Payment Status Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};