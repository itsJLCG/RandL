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
  AUTO_LOGIN_SUCCESS
} from '../constants/actionTypes';

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_REQUEST:
    case SIGNUP_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null
      };

      case LOGIN_SUCCESS:
        case SIGNUP_SUCCESS:
          return {
            ...state,
            isLoading: false,
            isAuthenticated: true,
            user: {
              ...action.payload.user,
              name: action.payload.user.name,
              address: action.payload.user.address, // Ensure address is included
            },
            token: action.payload.token
          };

    case LOGIN_FAILURE:
    case SIGNUP_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isAuthenticated: false
      };

    case FETCH_PROFILE_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null
      };

      case FETCH_PROFILE_SUCCESS:
        return {
          ...state,
          isLoading: false,
          user: {
            ...state.user,
            ...action.payload,
            image: action.payload.image || state.user.image
          },
          isAuthenticated: true,
          error: null
        };

    case FETCH_PROFILE_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case LOGOUT:
      return {
        ...initialState
      };
      
    case AUTO_LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };

    default:
      return state;
  }
}