import { Platform } from 'react-native';
import {
  FETCH_CATEGORIES_REQUEST,
  FETCH_CATEGORIES_SUCCESS,
  FETCH_CATEGORIES_FAILURE,
  CREATE_CATEGORY_REQUEST,
  CREATE_CATEGORY_SUCCESS,
  CREATE_CATEGORY_FAILURE,
  UPDATE_CATEGORY_REQUEST,
  UPDATE_CATEGORY_SUCCESS,
  UPDATE_CATEGORY_FAILURE,
  DELETE_CATEGORY_REQUEST,
  DELETE_CATEGORY_SUCCESS,
  DELETE_CATEGORY_FAILURE
} from '../constants/actionTypes';
import { API_URL_EMULATOR, API_URL_DEVICE } from '@env';

// Configure API URL based on platform and environment
const API_URL = __DEV__
  ? Platform.select({
    android: Platform.isEmulator ? API_URL_EMULATOR : API_URL_DEVICE,
    default: API_URL_DEVICE
  })
  : API_URL_DEVICE;

export const fetchCategories = () => async (dispatch, getState) => {
  try {
    dispatch({ type: FETCH_CATEGORIES_REQUEST });

    const { auth } = getState();
    const token = auth?.token;

    console.log('Attempting to fetch categories from:', `${API_URL}/api/categories`);
    console.log('Using token:', token);

    const response = await fetch(`${API_URL}/api/categories`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    // Log raw response for debugging
    const responseText = await response.text();
    console.log('Raw API Response:', responseText);

    // Try to parse the response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response:', responseText.substring(0, 200));
      throw new Error('Server returned invalid JSON');
    }

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    console.log('Successfully parsed categories:', data);

    dispatch({
      type: FETCH_CATEGORIES_SUCCESS,
      payload: data.categories || []
    });

    return { success: true, categories: data.categories || [] };
  } catch (error) {
    console.error('Fetch Categories Error:', error);
    dispatch({
      type: FETCH_CATEGORIES_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};

export const createCategory = (categoryData) => async (dispatch, getState) => {
  try {
    dispatch({ type: CREATE_CATEGORY_REQUEST });

    const { auth } = getState();
    const token = auth?.token;

    if (!token) {
      throw new Error('Authentication token not found');
    }

    console.log('Creating category with:', {
      url: `${API_URL}/api/categories`,
      token: token ? 'Bearer token present' : 'No token',
      data: categoryData
    });

    const response = await fetch(`${API_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(categoryData)
    });

    // Log raw response for debugging
    const responseText = await response.text();
    console.log('Raw API Response:', responseText);

    // Try to parse the response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response:', responseText.substring(0, 200));
      throw new Error('Server returned invalid JSON');
    }

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    dispatch({
      type: CREATE_CATEGORY_SUCCESS,
      payload: data.category
    });

    return { success: true, category: data.category };
  } catch (error) {
    console.error('Create Category Error:', error);
    dispatch({
      type: CREATE_CATEGORY_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};

export const updateCategory = (categoryId, categoryData) => async (dispatch, getState) => {
  try {
    dispatch({ type: UPDATE_CATEGORY_REQUEST });

    const { auth } = getState();
    const token = auth?.token;

    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_URL}/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(categoryData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    dispatch({
      type: UPDATE_CATEGORY_SUCCESS,
      payload: data.category
    });

    return { success: true, category: data.category };
  } catch (error) {
    console.error('Update Category Error:', error);
    dispatch({
      type: UPDATE_CATEGORY_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};

export const deleteCategory = (categoryId) => async (dispatch, getState) => {
  try {
    dispatch({ type: DELETE_CATEGORY_REQUEST });

    const { auth } = getState();
    const token = auth?.token;

    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_URL}/api/categories/${categoryId}`, {
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
      type: DELETE_CATEGORY_SUCCESS,
      payload: categoryId
    });

    return { success: true, message: 'Category deleted successfully' };
  } catch (error) {
    console.error('Delete Category Error:', error);
    dispatch({
      type: DELETE_CATEGORY_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};