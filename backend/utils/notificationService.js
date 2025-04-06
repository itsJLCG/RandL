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
    const result = await sendPushNotification(user.pushToken, title, body, data);
    
    // If token is stale, remove it
    if (!result.success && result.staleToken) {
      await exports.removeStaleToken(result.staleToken);
    }
    
    return result.success;
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
    const staleTokens = [];
    await Promise.all(
      users.map(async (user) => {
        const result = await sendPushNotification(user.pushToken, title, body, data);
        if (!result.success && result.staleToken) {
          staleTokens.push(result.staleToken);
        }
      })
    );
    
    // Clean up any stale tokens that were detected
    if (staleTokens.length > 0) {
      console.log(`Cleaning up ${staleTokens.length} stale push tokens`);
      await Promise.all(staleTokens.map(token => exports.removeStaleToken(token)));
    }
    
    console.log(`Sent promotion notifications to ${users.length - staleTokens.length} users`);
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

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    const responseData = await response.json();
    
    // Check for token errors in the response
    if (responseData.data && responseData.data.status === 'error') {
      // If token is invalid, return the token for cleanup
      if (responseData.data.details && responseData.data.details.error === 'DeviceNotRegistered') {
        console.log(`Stale push token detected: ${pushToken}`);
        return { success: false, staleToken: pushToken };
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Push notification error:', error);
    return { success: false };
  }
}

// Add function to remove stale token
exports.removeStaleToken = async (staleToken) => {
  try {
    const result = await User.updateOne(
      { pushToken: staleToken },
      { $set: { pushToken: null } }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`Removed stale token from user record: ${staleToken}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to remove stale token:', error);
    return false;
  }
};