import {
    FETCH_USERS_REQUEST,
    FETCH_USERS_SUCCESS,
    FETCH_USERS_FAILURE,
    UPDATE_USER_ROLE_SUCCESS,
    DELETE_USER_SUCCESS
  } from '../constants/actionTypes';
  
  const initialState = {
    users: [],
    isLoading: false,
    error: null
  };
  
  export default function userReducer(state = initialState, action) {
    switch (action.type) {
      case FETCH_USERS_REQUEST:
        return {
          ...state,
          isLoading: true,
          error: null
        };
      
      case FETCH_USERS_SUCCESS:
        return {
          ...state,
          users: action.payload,
          isLoading: false,
          error: null
        };
      
      case FETCH_USERS_FAILURE:
        return {
          ...state,
          isLoading: false,
          error: action.payload
        };
      
      case UPDATE_USER_ROLE_SUCCESS:
        return {
          ...state,
          users: state.users.map(user =>
            user._id === action.payload._id ? action.payload : user
          )
        };
      
      case DELETE_USER_SUCCESS:
        return {
          ...state,
          users: state.users.filter(user => user._id !== action.payload)
        };
      
      default:
        return state;
    }
  }