import axios from 'axios';
import { Platform } from 'react-native';
import {
  CREATE_REVIEW_REQUEST,
  CREATE_REVIEW_SUCCESS,
  CREATE_REVIEW_FAILURE
} from '../constants/actionTypes';
import { API_URL_EMULATOR, API_URL_DEVICE } from '@env';

// Configure API URL based on platform and environment
const API_URL = __DEV__
  ? Platform.select({
    android: Platform.isEmulator ? API_URL_EMULATOR : API_URL_DEVICE,
    default: API_URL_DEVICE
  })
  : API_URL_DEVICE;

console.log('Using API URL:', API_URL);

export const createReview = (reviewData) => async (dispatch, getState) => {
  try {
    dispatch({ type: CREATE_REVIEW_REQUEST });

    const { token } = getState().auth.user;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };

    const { data } = await axios.post(
      `${API_URL}/api/reviews`,
      reviewData,
      config
    );

    dispatch({
      type: CREATE_REVIEW_SUCCESS,
      payload: data.review
    });

    return data;
  } catch (error) {
    dispatch({
      type: CREATE_REVIEW_FAILURE,
      payload: error.response?.data?.error || 'Error creating review'
    });
    throw new Error(error.response?.data?.error || 'Error creating review');
  }
};

export const getUserReviews = () => async (dispatch, getState) => {
    try {
      dispatch({ type: 'GET_USER_REVIEWS_REQUEST' });
  
      const { token } = getState().auth.user;
  
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
  
      const { data } = await axios.get(`${API_URL}/api/reviews/me`, config);
  
      dispatch({
        type: 'GET_USER_REVIEWS_SUCCESS',
        payload: data.reviews
      });
    } catch (error) {
      dispatch({
        type: 'GET_USER_REVIEWS_FAILURE',
        payload: error.response?.data?.error || 'Error fetching reviews'
      });
      throw error;
    }
  };
  
  export const deleteReview = (reviewId) => async (dispatch, getState) => {
    try {
      dispatch({ type: 'DELETE_REVIEW_REQUEST' });
  
      const { token } = getState().auth.user;
  
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
  
      await axios.delete(`${API_URL}/api/reviews/${reviewId}`, config);
  
      dispatch({
        type: 'DELETE_REVIEW_SUCCESS',
        payload: reviewId
      });
    } catch (error) {
      dispatch({
        type: 'DELETE_REVIEW_FAILURE',
        payload: error.response?.data?.error || 'Error deleting review'
      });
      throw error;
    }
  };

  export const updateReview = (reviewId, reviewData) => async (dispatch, getState) => {
    try {
      dispatch({ type: 'UPDATE_REVIEW_REQUEST' });
  
      const { token } = getState().auth.user;
  
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
  
      const { data } = await axios.put(
        `${API_URL}/api/reviews/${reviewId}`,
        reviewData,
        config
      );
  
      dispatch({
        type: 'UPDATE_REVIEW_SUCCESS',
        payload: data.review
      });
  
      return data;
    } catch (error) {
      dispatch({
        type: 'UPDATE_REVIEW_FAILURE',
        payload: error.response?.data?.error || 'Error updating review'
      });
      throw new Error(error.response?.data?.error || 'Error updating review');
    }
  };