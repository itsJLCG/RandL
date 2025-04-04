import { Platform } from 'react-native';
import {
  PLACE_ORDER_REQUEST,
  PLACE_ORDER_SUCCESS,
  PLACE_ORDER_FAILURE,
  FETCH_ORDERS_REQUEST,
  FETCH_ORDERS_SUCCESS,
  FETCH_ORDERS_FAILURE,
  FETCH_ORDER_DETAILS_REQUEST,
  FETCH_ORDER_DETAILS_SUCCESS,
  FETCH_ORDER_DETAILS_FAILURE,
  CANCEL_ORDER_REQUEST,
  CANCEL_ORDER_SUCCESS,
  CANCEL_ORDER_FAILURE,
  UPDATE_ORDER_STATUS_REQUEST,
  UPDATE_ORDER_STATUS_SUCCESS,
  UPDATE_ORDER_STATUS_FAILURE
} from '../constants/actionTypes';
import { API_URL_EMULATOR, API_URL_DEVICE } from '@env';

// Configure API URL based on platform and environment
const API_URL = __DEV__
  ? Platform.select({
    android: Platform.isEmulator ? API_URL_EMULATOR : API_URL_DEVICE,
    default: API_URL_DEVICE
  })
  : API_URL_DEVICE;

console.log('Using Order API URL:', API_URL);

// Place a new order
export const placeOrder = (orderData) => async (dispatch, getState) => {
  try {
    dispatch({ type: PLACE_ORDER_REQUEST });
    
    const { auth } = getState();
    const token = auth?.token;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData),
      credentials: 'include'
    });
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Received non-JSON response:', text);
      throw new Error('Invalid server response format');
    }
    
    const data = await response.json();
    console.log('Place order response:', data);
    
    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }
    
    dispatch({
      type: PLACE_ORDER_SUCCESS,
      payload: data.order
    });
    
    return { success: true, orderId: data.order._id };
  } catch (error) {
    console.error('Place Order Error:', error);
    dispatch({
      type: PLACE_ORDER_FAILURE,
      payload: error.message || 'Failed to place order'
    });
    return { success: false, error: error.message };
  }
};

// Fetch user orders
export const fetchOrders = () => async (dispatch, getState) => {
  try {
    dispatch({ type: FETCH_ORDERS_REQUEST });
    
    const { auth } = getState();
    const token = auth?.token;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await fetch(`${API_URL}/api/orders`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    console.log('Fetch orders response:', data);
    
    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }
    
    dispatch({
      type: FETCH_ORDERS_SUCCESS,
      payload: data.orders
    });
    
    return { success: true, orders: data.orders };
  } catch (error) {
    console.error('Fetch Orders Error:', error);
    dispatch({
      type: FETCH_ORDERS_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Fetch order details
export const fetchOrderDetails = (orderId) => async (dispatch, getState) => {
  try {
    dispatch({ type: FETCH_ORDER_DETAILS_REQUEST });
    
    const { auth } = getState();
    const token = auth?.token;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    console.log('Fetch order details response:', data);
    
    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }
    
    dispatch({
      type: FETCH_ORDER_DETAILS_SUCCESS,
      payload: data.order
    });
    
    return { success: true, order: data.order };
  } catch (error) {
    console.error('Fetch Order Details Error:', error);
    dispatch({
      type: FETCH_ORDER_DETAILS_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

// Cancel order
export const cancelOrder = (orderId) => async (dispatch, getState) => {
  try {
    dispatch({ type: CANCEL_ORDER_REQUEST });
    
    const { auth } = getState();
    const token = auth?.token;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    console.log('Cancel order response:', data);
    
    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }
    
    dispatch({
      type: CANCEL_ORDER_SUCCESS,
      payload: data.order
    });
    
    return { success: true };
  } catch (error) {
    console.error('Cancel Order Error:', error);
    dispatch({
      type: CANCEL_ORDER_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

export const updateOrderStatus = (orderId, status) => async (dispatch, getState) => {
  try {
    dispatch({ type: UPDATE_ORDER_STATUS_REQUEST });
    
    const { auth } = getState();
    const token = auth?.token;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }
    
    dispatch({
      type: UPDATE_ORDER_STATUS_SUCCESS,
      payload: data.order
    });
    
    return { success: true };
  } catch (error) {
    console.error('Update Order Status Error:', error);
    dispatch({
      type: UPDATE_ORDER_STATUS_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};