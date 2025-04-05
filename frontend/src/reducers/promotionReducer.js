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
  
  const initialState = {
    promotions: [],
    activePromotions: [],
    isLoading: false,
    error: null
  };
  
  export default function promotionReducer(state = initialState, action) {
    switch (action.type) {
      case FETCH_PROMOTIONS_REQUEST:
      case CREATE_PROMOTION_REQUEST:
      case UPDATE_PROMOTION_REQUEST:
      case DELETE_PROMOTION_REQUEST:
        return {
          ...state,
          isLoading: true,
          error: null
        };
  
      case FETCH_PROMOTIONS_SUCCESS:
        return {
          ...state,
          isLoading: false,
          promotions: action.payload,
          error: null
        };
  
      case CREATE_PROMOTION_SUCCESS:
        return {
          ...state,
          isLoading: false,
          promotions: [action.payload, ...state.promotions],
          error: null
        };
  
      case UPDATE_PROMOTION_SUCCESS:
        return {
          ...state,
          isLoading: false,
          promotions: state.promotions.map(promotion =>
            promotion._id === action.payload._id ? action.payload : promotion
          ),
          error: null
        };
  
      case DELETE_PROMOTION_SUCCESS:
        return {
          ...state,
          isLoading: false,
          promotions: state.promotions.filter(promotion => promotion._id !== action.payload),
          error: null
        };
  
      case FETCH_PROMOTIONS_FAILURE:
      case CREATE_PROMOTION_FAILURE:
      case UPDATE_PROMOTION_FAILURE:
      case DELETE_PROMOTION_FAILURE:
        return {
          ...state,
          isLoading: false,
          error: action.payload
        };
      case 'FETCH_ACTIVE_PROMOTIONS_SUCCESS':
        return {
         ...state,
          isLoading: false,
          activePromotions: action.payload,
          error: null
        };        
        
      default:
        return state;
    }
  }