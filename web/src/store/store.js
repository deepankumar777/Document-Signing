import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './walletSlice.js';

export default configureStore({
  reducer: {
    wallet: walletReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

