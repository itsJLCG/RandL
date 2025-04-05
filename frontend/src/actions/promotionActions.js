import { Platform } from 'react-native';
import {
  FETCH_PROMOTIONS_REQUEST,
  FETCH_PROMOTIONS_SUCCESS,
  FETCH_PROMOTIONS_FAILURE,
  CREATE_PROMOTION_REQUEST,
  CREATE_PROMOTION_SUCCESS,
  CREATE_PROMOTION_FAILURE,
  UPDATE_PROMOTION_REQUEST,
  UPDATE_PROMOTION_SUCCESS,
  UPDATE_PROMOTION_FAILURE,
  DELETE_PROMOTION_REQUEST,
  DELETE_PROMOTION_SUCCESS,
  DELETE_PROMOTION_FAILURE
} from '../constants/actionTypes';
import { API_URL_EMULATOR, API_URL_DEVICE } from '@env';

// Configure API URL based on platform and environment
const API_URL = __DEV__
  ? Platform.select({
    android: Platform.isEmulator ? API_URL_EMULATOR : API_URL_DEVICE,
    default: API_URL_DEVICE
  })
  : API_URL_DEVICE;

console.log('Using Promotion API URL:', API_URL);

// Fetch all promotions
export const fetchPromotions = () => async (dispatch, getState) => {
  try {
    dispatch({ type: FETCH_PROMOTIONS_REQUEST });

    // Get auth token from state
    const { auth } = getState();
    const token = auth?.token;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_URL}/api/promotions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log('Fetch promotions response:', data);

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    dispatch({
      type: FETCH_PROMOTIONS_SUCCESS,
      payload: data.promotions
    });

    return { success: true, promotions: data.promotions };
  } catch (error) {
    console.error('Fetch Promotions Error:', error);
    dispatch({
      type: FETCH_PROMOTIONS_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};

// Create new promotion
export const createPromotion = (promotionData) => async (dispatch, getState) => {
  try {
    dispatch({ type: CREATE_PROMOTION_REQUEST });

    const { auth } = getState();
    const token = auth?.token;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_URL}/api/promotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(promotionData)
    });

    const data = await response.json();
    console.log('Create promotion response:', data);

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    dispatch({
      type: CREATE_PROMOTION_SUCCESS,
      payload: data.promotion
    });

    return { success: true, promotion: data.promotion };
  } catch (error) {
    console.error('Create Promotion Error:', error);
    dispatch({
      type: CREATE_PROMOTION_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};

// Update promotion
export const updatePromotion = (id, promotionData) => async (dispatch, getState) => {
  try {
    dispatch({ type: UPDATE_PROMOTION_REQUEST });

    const { auth } = getState();
    const token = auth?.token;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_URL}/api/promotions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(promotionData)
    });

    const data = await response.json();
    console.log('Update promotion response:', data);

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    dispatch({
      type: UPDATE_PROMOTION_SUCCESS,
      payload: data.promotion
    });

    return { success: true, promotion: data.promotion };
  } catch (error) {
    console.error('Update Promotion Error:', error);
    dispatch({
      type: UPDATE_PROMOTION_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};

// Delete promotion
export const deletePromotion = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: DELETE_PROMOTION_REQUEST });

    const { auth } = getState();
    const token = auth?.token;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_URL}/api/promotions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log('Delete promotion response:', data);

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    dispatch({
      type: DELETE_PROMOTION_SUCCESS,
      payload: id
    });

    return { success: true };
  } catch (error) {
    console.error('Delete Promotion Error:', error);
    dispatch({
      type: DELETE_PROMOTION_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};

// Fetch active promotions for customers
export const fetchActivePromotions = () => async (dispatch, getState) => {
  try {
    dispatch({ type: FETCH_PROMOTIONS_REQUEST });

    const response = await fetch(`${API_URL}/api/promotions/active`);

    const data = await response.json();
    console.log('Fetch active promotions response:', data);

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    dispatch({
      type: 'FETCH_ACTIVE_PROMOTIONS_SUCCESS',
      payload: data.promotions
    });

    return { success: true, promotions: data.promotions };
  } catch (error) {
    console.error('Fetch Active Promotions Error:', error);
    dispatch({
      type: FETCH_PROMOTIONS_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};