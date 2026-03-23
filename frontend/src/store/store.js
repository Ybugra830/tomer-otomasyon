import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import optionsReducer from './slices/optionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    options: optionsReducer,
  },
});
