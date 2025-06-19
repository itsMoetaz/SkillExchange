import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import themeSlice from './slices/themeSlice';
import profileReducer from './slices/profileSlice';
import skillReducer from './slices/skillSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    theme: themeSlice,
    profile: profileReducer,
    skills: skillReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;