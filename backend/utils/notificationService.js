const fetch = require('node-fetch');
const User = require('../models/User');
const Order = require('../models/Order');

// Function to send push notification to a user
exports.sendUserNotification = async (userId, title, body, data = {}) => {
  try {
    // Find user to get their push token
    const user = await User.findById(userId);
    
    if (!user || !user.pushToken) {
      console.log(`No valid push token found for user ${userId}`);
      return false;
    }
    
    // Send the notification
    await sendPushNotification(user.pushToken, title, body, data);
    return true;
  } catch (error) {
    console.error('Send notification error:', error);
    return false;
  }
};

// Function to send order status update notification
exports.sendOrderStatusNotification = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('user', 'name pushToken');
    
    if (!order || !order.user || !order.user.pushToken) {
      console.log(`Cannot send notification for order ${orderId}: Missing user or push token`);
      return false;
    }
    
    const title = 'Order Status Update';
    const body = `Your order #${order.orderId} has been updated to: ${order.status}`;
    
    // Include order data to allow deep linking
    const data = {
      type: 'ORDER_STATUS_UPDATE',
      orderId: order._id.toString(),
      status: order.status
    };
    
    await sendPushNotification(order.user.pushToken, title, body, data);
    return true;
  } catch (error) {
    console.error('Send order notification error:', error);
    return false;
  }
};

// Send notification when a promotion is created or updated to active
exports.sendPromotionNotification = async (promotion) => {
  try {
    // Find all users who have push tokens
    const users = await User.find({ pushToken: { $exists: true, $ne: null } });
    
    if (!users || users.length === 0) {
      console.log('No users with push tokens found');
      return false;
    }

    const title = 'New Promotion Available!';
    const body = `${promotion.title}: ${promotion.discountPercentage}% discount - Check it out now!`;
    
    // Include promotion data to allow deep linking
    const data = {
      type: 'NEW_PROMOTION',
      promotionId: promotion._id.toString()
    };
    
    // Send notifications to all users with push tokens
    const results = await Promise.all(
      users.map(user => 
        sendPushNotification(user.pushToken, title, body, data)
      )
    );
    
    console.log(`Sent promotion notifications to ${results.filter(Boolean).length} users`);
    return true;
  } catch (error) {
    console.error('Send promotion notification error:', error);
    return false;
  }
};

// Helper function to send push notification via Expo's push service
async function sendPushNotification(pushToken, title, body, data = {}) {
  const message = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}