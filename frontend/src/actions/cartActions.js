import {
  FETCH_CART_REQUEST,
  FETCH_CART_SUCCESS,
  FETCH_CART_FAILURE,
  ADD_TO_CART_REQUEST,
  ADD_TO_CART_SUCCESS,
  ADD_TO_CART_FAILURE,
  REMOVE_FROM_CART_REQUEST,
  REMOVE_FROM_CART_SUCCESS,
  REMOVE_FROM_CART_FAILURE,
  UPDATE_CART_QUANTITY_REQUEST,
  UPDATE_CART_QUANTITY_SUCCESS,
  UPDATE_CART_QUANTITY_FAILURE,
  REMOVE_MULTIPLE_FROM_CART_REQUEST,
  REMOVE_MULTIPLE_FROM_CART_SUCCESS,
  REMOVE_MULTIPLE_FROM_CART_FAILURE,
  CLEAR_CART_REQUEST,
  CLEAR_CART_SUCCESS,
  CLEAR_CART_FAILURE
} from '../constants/cartConstants';

import {
  getCartItems,
  addCartItem,
  removeCartItem,
  updateCartItemQuantityInDb,
  removeMultipleCartItems,
  clearCart as clearCartInDb
} from '../utils/database';

export const fetchCart = () => async (dispatch, getState) => {
  try {
    dispatch({ type: FETCH_CART_REQUEST });
    
    const { auth } = getState();
    const userId = auth?.user?._id;
    
    const items = await getCartItems(userId);
    
    dispatch({
      type: FETCH_CART_SUCCESS,
      payload: items
    });
    
    return { success: true, items };
  } catch (error) {
    dispatch({
      type: FETCH_CART_FAILURE,
      payload: error.message || 'Could not fetch cart items'
    });
    return { success: false, error: error.message };
  }
};

export const addToCart = (product, quantity = 1) => async (dispatch, getState) => {
  try {
    dispatch({ type: ADD_TO_CART_REQUEST });
    
    const { auth } = getState();
    const userId = auth?.user?._id;
    
    await addCartItem(product, quantity, userId);

    const items = await getCartItems(userId);
    
    dispatch({
      type: ADD_TO_CART_SUCCESS,
      payload: items
    });
    
    return { success: true };
  } catch (error) {
    dispatch({
      type: ADD_TO_CART_FAILURE,
      payload: error.message || 'Could not add item to cart'
    });
    return { success: false, error: error.message };
  }
};

export const removeFromCart = (itemId) => async (dispatch, getState) => {
  try {
    dispatch({ type: REMOVE_FROM_CART_REQUEST });
    
    const { auth } = getState();
    const userId = auth?.user?._id;
    
    await removeCartItem(itemId, userId);
    
    // Fetch updated cart
    const items = await getCartItems(userId);
    
    dispatch({
      type: REMOVE_FROM_CART_SUCCESS,
      payload: items
    });
    
    return { success: true };
  } catch (error) {
    dispatch({
      type: REMOVE_FROM_CART_FAILURE,
      payload: error.message || 'Could not remove item from cart'
    });
    return { success: false, error: error.message };
  }
};

export const updateCartItemQuantity = (itemId, quantity) => async (dispatch, getState) => {
  try {
    dispatch({ type: UPDATE_CART_QUANTITY_REQUEST });
    
    const { auth } = getState();
    const userId = auth?.user?._id;
    
    await updateCartItemQuantityInDb(itemId, quantity, userId);

    const items = await getCartItems(userId);
    
    dispatch({
      type: UPDATE_CART_QUANTITY_SUCCESS,
      payload: items
    });
    
    return { success: true };
  } catch (error) {
    dispatch({
      type: UPDATE_CART_QUANTITY_FAILURE,
      payload: error.message || 'Could not update cart quantity'
    });
    return { success: false, error: error.message };
  }
};

export const removeMultipleFromCart = (productIds) => async (dispatch, getState) => {
  try {
    dispatch({ type: REMOVE_MULTIPLE_FROM_CART_REQUEST });
    
    const { auth } = getState();
    const userId = auth?.user?._id;
    
    await removeMultipleCartItems(productIds, userId);
    
    const items = await getCartItems(userId);
    
    dispatch({
      type: REMOVE_MULTIPLE_FROM_CART_SUCCESS,
      payload: items
    });
    
    return { success: true };
  } catch (error) {
    dispatch({
      type: REMOVE_MULTIPLE_FROM_CART_FAILURE,
      payload: error.message || 'Could not remove items from cart'
    });
    return { success: false, error: error.message };
  }
};

export const clearCart = () => async (dispatch, getState) => {
  try {
    dispatch({ type: CLEAR_CART_REQUEST });
    
    const { auth } = getState();
    const userId = auth?.user?._id;
    
    await clearCartInDb(userId);
    
    dispatch({
      type: CLEAR_CART_SUCCESS,
      payload: []
    });
    
    return { success: true };
  } catch (error) {
    dispatch({
      type: CLEAR_CART_FAILURE,
      payload: error.message || 'Could not clear cart'
    });
    return { success: false, error: error.message };
  }
};