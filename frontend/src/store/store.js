import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../reducers/productReducer';
import cartReducer from '../reducers/cartReducer';
import authReducer from '../reducers/authReducer';
import orderReducer from '../reducers/orderReducer';
import categoryReducer from '../reducers/categoryReducer';
import userReducer from '../reducers/userReducer';
import { reviewReducer } from '../reducers/reviewReducer';
import promotionReducer from '../reducers/promotionReducer';

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    auth: authReducer,
    orders: orderReducer,
    categories: categoryReducer,
    users: userReducer,
    reviews: reviewReducer,
    promotions: promotionReducer,
  },
});