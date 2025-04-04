import { 
  ADD_TO_CART_REQUEST, 
  ADD_TO_CART_SUCCESS, 
  ADD_TO_CART_FAILURE,
  REMOVE_FROM_CART_REQUEST,
  REMOVE_FROM_CART_SUCCESS,
  REMOVE_FROM_CART_FAILURE,
  CLEAR_CART_REQUEST,
  CLEAR_CART_SUCCESS,
  CLEAR_CART_FAILURE,
  FETCH_CART_REQUEST,
  FETCH_CART_SUCCESS,
  FETCH_CART_FAILURE,
  UPDATE_CART_QUANTITY_REQUEST,
  UPDATE_CART_QUANTITY_SUCCESS,
  UPDATE_CART_QUANTITY_FAILURE,
  REMOVE_MULTIPLE_FROM_CART_REQUEST,
  REMOVE_MULTIPLE_FROM_CART_SUCCESS,
  REMOVE_MULTIPLE_FROM_CART_FAILURE
} from '../constants/cartConstants';

const initialState = {
  items: [],
  loading: false,
  error: null
};

export default function cartReducer(state = initialState, action) {
  switch (action.type) {
    // Request cases - set loading to true
    case FETCH_CART_REQUEST:
    case ADD_TO_CART_REQUEST:
    case REMOVE_FROM_CART_REQUEST:
    case UPDATE_CART_QUANTITY_REQUEST:
    case REMOVE_MULTIPLE_FROM_CART_REQUEST:
    case CLEAR_CART_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    // Failure cases - set error and stop loading
    case FETCH_CART_FAILURE:
    case ADD_TO_CART_FAILURE:
    case REMOVE_FROM_CART_FAILURE:
    case UPDATE_CART_QUANTITY_FAILURE:
    case REMOVE_MULTIPLE_FROM_CART_FAILURE:
    case CLEAR_CART_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
      
    // Success cases - handle each specific case
    case FETCH_CART_SUCCESS:
    case ADD_TO_CART_SUCCESS:
    case REMOVE_FROM_CART_SUCCESS:
    case REMOVE_MULTIPLE_FROM_CART_SUCCESS:
    case UPDATE_CART_QUANTITY_SUCCESS:
      return {
        ...state,
        loading: false,
        items: action.payload,
        error: null
      };
      
    case CLEAR_CART_SUCCESS:
      return {
        ...state,
        loading: false,
        items: [],
        error: null
      };
      
    default:
      return state;
  }
}