import { Platform } from 'react-native';
import { API_URL_EMULATOR, API_URL_DEVICE } from '@env';
import {
  FETCH_USERS_REQUEST,
  FETCH_USERS_SUCCESS,
  FETCH_USERS_FAILURE,
  UPDATE_USER_ROLE_REQUEST,
  UPDATE_USER_ROLE_SUCCESS,
  UPDATE_USER_ROLE_FAILURE,
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAILURE
} from '../constants/actionTypes';

// Configure API URL based on platform and environment
const API_URL = __DEV__
  ? Platform.select({
    android: Platform.isEmulator ? API_URL_EMULATOR : API_URL_DEVICE,
    default: API_URL_DEVICE
  })
  : API_URL_DEVICE;

// Fetch all users
export const fetchUsers = () => async (dispatch, getState) => {
    dispatch({ type: FETCH_USERS_REQUEST });
    
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getState().auth.token}`
        }
      });
  
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Fetch Users Response:', data); // Debug log
  
      if (data.success) {
        dispatch({
          type: FETCH_USERS_SUCCESS,
          payload: data.users
        });
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Fetch Users Error:', error);
      dispatch({
        type: FETCH_USERS_FAILURE,
        payload: error.message
      });
    }
  };

// Update user role
export const updateUserRole = (userId, role) => async (dispatch, getState) => {
  dispatch({ type: UPDATE_USER_ROLE_REQUEST });
  
  try {
    const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getState().auth.token}`
      },
      body: JSON.stringify({ role })
    });
    const data = await response.json();

    if (data.success) {
      dispatch({
        type: UPDATE_USER_ROLE_SUCCESS,
        payload: data.user
      });
      return { success: true };
    } else {
      throw new Error(data.error || 'Failed to update user role');
    }
  } catch (error) {
    console.error('Update Role Error:', error);
    dispatch({
      type: UPDATE_USER_ROLE_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};

// Delete user
export const deleteUser = (userId) => async (dispatch, getState) => {
  dispatch({ type: DELETE_USER_REQUEST });
  
  try {
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getState().auth.token}`
      }
    });
    const data = await response.json();

    if (data.success) {
      dispatch({
        type: DELETE_USER_SUCCESS,
        payload: userId
      });
      return { success: true };
    } else {
      throw new Error(data.error || 'Failed to delete user');
    }
  } catch (error) {
    console.error('Delete User Error:', error);
    dispatch({
      type: DELETE_USER_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};