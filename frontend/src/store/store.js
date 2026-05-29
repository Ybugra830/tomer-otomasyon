import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import optionsReducer from './slices/optionsSlice';
import studentReducer from './slices/studentSlice';
import instructorReducer from './slices/instructorSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    options: optionsReducer,
    student: studentReducer,
    instructor: instructorReducer,
  },
});
