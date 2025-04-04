import { Platform } from 'react-native';
import {
  FETCH_PRODUCTS_REQUEST,
  FETCH_PRODUCTS_SUCCESS,
  FETCH_PRODUCTS_FAILURE,
  CREATE_PRODUCT_REQUEST,
  CREATE_PRODUCT_SUCCESS,
  CREATE_PRODUCT_FAILURE,
  UPDATE_PRODUCT_REQUEST,
  UPDATE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_FAILURE,
  DELETE_PRODUCT_REQUEST,
  DELETE_PRODUCT_SUCCESS,
  DELETE_PRODUCT_FAILURE,
  FETCH_PRODUCT_DETAILS_REQUEST,
  FETCH_PRODUCT_DETAILS_SUCCESS,
  FETCH_PRODUCT_DETAILS_FAILURE
} from '../constants/actionTypes';
import { API_URL_EMULATOR, API_URL_DEVICE } from '@env';

// Configure API URL based on platform and environment
const API_URL = __DEV__
  ? Platform.select({
    android: Platform.isEmulator ? API_URL_EMULATOR : API_URL_DEVICE,
    default: API_URL_DEVICE
  })
  : API_URL_DEVICE;

console.log('Using API URL:', API_URL); // Debug log to verify URL

// Fetch all products
export const fetchProducts = () => async (dispatch, getState) => {
  try {
    // Dispatch request action before fetching
    dispatch({ type: FETCH_PRODUCTS_REQUEST });

    // Get auth token from state
    const { auth } = getState();
    const token = auth?.token;

    const response = await fetch(`${API_URL}/api/products`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    const data = await response.json();
    console.log('Fetch products response:', data);

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    dispatch({
      type: FETCH_PRODUCTS_SUCCESS,
      payload: data.products
    });

    return { success: true, products: data.products };
  } catch (error) {
    console.error('Fetch Products Error:', error);
    dispatch({
      type: FETCH_PRODUCTS_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};

// Create new product
export const createProduct = (productData) => async (dispatch, getState) => {
  try {
    dispatch({ type: CREATE_PRODUCT_REQUEST });

    const { auth } = getState();
    const token = auth?.token;

    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Ensure image data is properly structured
    if (!productData.image || !productData.image.public_id || !productData.image.url) {
      throw new Error('Product image information is required');
    }

    const response = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: productData.name,
        price: productData.price,
        description: productData.description,
        category: productData.category,
        image: {
          public_id: productData.image.public_id,
          url: productData.image.url
        }
      })
    });

    const data = await response.json();
    console.log('Create product response:', data);

    if (!data.success) {
      throw new Error(data.error || 'Failed to create product');
    }

    dispatch({
      type: CREATE_PRODUCT_SUCCESS,
      payload: data.product
    });

    return { success: true, product: data.product };
  } catch (error) {
    console.error('Create Product Error:', error);
    dispatch({
      type: CREATE_PRODUCT_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};

export const updateProduct = (productId, productData) => async (dispatch, getState) => {
  try {
    dispatch({ type: UPDATE_PRODUCT_REQUEST });

    const { auth } = getState();
    const token = auth?.token;

    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Ensure image data is properly structured if it exists
    if (productData.image && (!productData.image.public_id || !productData.image.url)) {
      throw new Error('Invalid image data format');
    }

    const response = await fetch(`${API_URL}/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: productData.name,
        price: productData.price,
        description: productData.description,
        category: productData.category,
        image: productData.image
      })
    });

    const data = await response.json();
    console.log('Update product response:', data);

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    dispatch({
      type: UPDATE_PRODUCT_SUCCESS,
      payload: data.product
    });

    return { success: true, product: data.product };
  } catch (error) {
    console.error('Update Product Error:', error);
    dispatch({
      type: UPDATE_PRODUCT_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};

export const deleteProduct = (productId) => async (dispatch, getState) => {
  try {
    dispatch({ type: DELETE_PRODUCT_REQUEST });

    const { auth } = getState();
    const token = auth?.token;

    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_URL}/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    dispatch({
      type: DELETE_PRODUCT_SUCCESS,
      payload: productId
    });

    return { success: true, message: 'Product deleted successfully' };
  } catch (error) {
    console.error('Delete Product Error:', error);
    dispatch({
      type: DELETE_PRODUCT_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};

export const fetchProductDetails = (productId) => async (dispatch, getState) => {
  try {
    dispatch({ type: FETCH_PRODUCT_DETAILS_REQUEST });

    const { auth } = getState();
    const token = auth?.token;

    const response = await fetch(`${API_URL}/api/products/${productId}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    const data = await response.json();
    console.log('Fetch product details response:', data);

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    dispatch({
      type: FETCH_PRODUCT_DETAILS_SUCCESS,
      payload: data.product
    });

    return { success: true, product: data.product };
  } catch (error) {
    console.error('Fetch Product Details Error:', error);
    dispatch({
      type: FETCH_PRODUCT_DETAILS_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};