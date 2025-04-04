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

const initialState = {
  products: [],
  product: null,
  isLoading: false,
  error: null
};

export default function productReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_PRODUCTS_REQUEST:
    case CREATE_PRODUCT_REQUEST:
    case UPDATE_PRODUCT_REQUEST:
    case DELETE_PRODUCT_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case FETCH_PRODUCTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        products: action.payload,
        error: null
      };

    case CREATE_PRODUCT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        products: [action.payload, ...state.products],
        error: null
      };

    case UPDATE_PRODUCT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        products: state.products.map(product =>
          product._id === action.payload._id ? action.payload : product
        ),
        error: null
      };

    case DELETE_PRODUCT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        products: state.products.filter(product => product._id !== action.payload),
        error: null
      };

    case FETCH_PRODUCTS_FAILURE:
    case CREATE_PRODUCT_FAILURE:
    case UPDATE_PRODUCT_FAILURE:
    case DELETE_PRODUCT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case FETCH_PRODUCT_DETAILS_REQUEST:
      return {
          ...state,
          isLoading: true,
          error: null
        };
      
    case FETCH_PRODUCT_DETAILS_SUCCESS:
        return {
          ...state,
          isLoading: false,
          product: action.payload,
          error: null
        };
      
    case FETCH_PRODUCT_DETAILS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };    
    default:
      return state;
  }
}