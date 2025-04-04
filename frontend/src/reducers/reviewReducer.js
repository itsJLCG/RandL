import {
    CREATE_REVIEW_REQUEST,
    CREATE_REVIEW_SUCCESS,
    CREATE_REVIEW_FAILURE
} from '../constants/actionTypes';

const initialState = {
    loading: false,
    error: null,
    reviews: []
};

export const reviewReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'GET_USER_REVIEWS_REQUEST':
        case 'DELETE_REVIEW_REQUEST':
            return {
                ...state,
                loading: true
            };

        case 'GET_USER_REVIEWS_SUCCESS':
            return {
                ...state,
                loading: false,
                reviews: action.payload,
                error: null
            };

        case 'DELETE_REVIEW_SUCCESS':
            return {
                ...state,
                loading: false,
                reviews: state.reviews.filter(review => review._id !== action.payload),
                error: null
            };

        case 'GET_USER_REVIEWS_FAILURE':
        case 'DELETE_REVIEW_FAILURE':
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        case 'UPDATE_REVIEW_REQUEST':
            return {
                ...state,
                loading: true
            };

        case 'UPDATE_REVIEW_SUCCESS':
            return {
                ...state,
                loading: false,
                reviews: state.reviews.map(review =>
                    review._id === action.payload._id ? action.payload : review
                ),
                error: null
            };

        case 'UPDATE_REVIEW_FAILURE':
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        default:
            return state;
    }
};