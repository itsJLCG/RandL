import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
  SIGNUP_FAILURE,
  LOGOUT,
  FETCH_PROFILE_REQUEST,
  FETCH_PROFILE_SUCCESS,
  FETCH_PROFILE_FAILURE,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAILURE,
  AUTO_LOGIN_SUCCESS
} from '../constants/actionTypes';
import { Platform } from 'react-native';
import { API_URL_EMULATOR, API_URL_DEVICE } from '@env';
import { 
  storeAuthToken, 
  clearAuthToken, 
  getStoredAuthToken 
} from '../utils/database';

// Configure base URL
const BASE_URL = __DEV__
  ? Platform.select({
      android: Platform.isEmulator ? API_URL_EMULATOR : API_URL_DEVICE,
      default: API_URL_DEVICE
    })
  : API_URL_DEVICE;

export const loginRequest = () => ({
  type: LOGIN_REQUEST
});

export const loginSuccess = (user) => ({
  type: LOGIN_SUCCESS,
  payload: user
});

export const loginFailure = (error) => ({
  type: LOGIN_FAILURE,
  payload: error
});

export const signupRequest = () => ({
  type: SIGNUP_REQUEST
});

export const signupSuccess = (user) => ({
  type: SIGNUP_SUCCESS,
  payload: user
});

export const signupFailure = (error) => ({
  type: SIGNUP_FAILURE,
  payload: error
});

export const logout = () => async (dispatch) => {
  try {
    // Clear token from SQLite
    await clearAuthToken();
    
    // Dispatch logout action
    dispatch({ type: LOGOUT });
    return { success: true };
  } catch (error) {
    console.error('Logout Error:', error);
    return { success: false, error: error.message };
  }
};


export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_REQUEST });

    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {

      await storeAuthToken(data.user._id, data.user.token);

      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          user: data.user,
          token: data.user.token 
        }
      });
      return { 
        success: true, 
        isAdmin: data.user.role === 'admin' 
      };
    } else {
      throw new Error(data.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login Error:', error);
    dispatch({
      type: LOGIN_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};

export const signup = (signupData) => async (dispatch) => {
  dispatch(signupRequest());
  try {
    const userData = {
      name: signupData.name,
      email: signupData.email,
      password: signupData.password,
      address: signupData.address,
      image: signupData.image 
    };
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signupData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      dispatch(signupSuccess(data.user));
      return { success: true };
    } else {
      dispatch(signupFailure(data.error));
      return { success: false, message: data.error };
    }
  } catch (error) {
    console.error('Signup Error:', error);
    dispatch(signupFailure(error.message));
    return { success: false, message: error.message };
  }
};

export const updateProfile = (userData) => async (dispatch, getState) => {
  dispatch({ type: UPDATE_PROFILE_REQUEST });

  try {
    const formData = {
      name: userData.name,
      email: userData.email,
      address: userData.address,
      image: userData.image
    };

    const response = await fetch(`${BASE_URL}/api/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getState().auth.token}`
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (data.success) {
      dispatch({
        type: UPDATE_PROFILE_SUCCESS,
        payload: data.user
      });
      return { success: true };
    } else {
      throw new Error(data.error || 'Update failed');
    }
  } catch (error) {
    dispatch({
      type: UPDATE_PROFILE_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};

export const fetchUserProfile = () => async (dispatch, getState) => {
  dispatch({ type: FETCH_PROFILE_REQUEST });

  try {
    const { token, user } = getState().auth;
    
    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.user) {
      const userData = {
        ...data.user,
        image: data.user.image || null
      };

      dispatch({
        type: FETCH_PROFILE_SUCCESS,
        payload: userData
      });
      return { success: true, user: userData };
    } else {
      throw new Error(data.message || 'Failed to fetch profile');
    }
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    dispatch({
      type: FETCH_PROFILE_FAILURE,
      payload: error.message
    });
    return { success: false, message: error.message };
  }
};

export const checkStoredCredentials = () => async (dispatch) => {
  try {
    const result = await getStoredAuthToken();
    
    if (result.success && result.token) {
      // Verify token is still valid with a backend call
      const response = await fetch(`${BASE_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          dispatch({
            type: AUTO_LOGIN_SUCCESS,
            payload: {
              user: data.user,
              token: result.token
            }
          });
          return { 
            success: true, 
            isAdmin: data.user.role === 'admin'
          };
        }
      } else {
        // Token is invalid, clear it
        await clearAuthToken();
        return { success: false };
      }
    }
    return { success: false };
  } catch (error) {
    console.error('Auto-login Error:', error);
    return { success: false, error: error.message };
  }
};

