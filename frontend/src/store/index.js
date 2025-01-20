import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import themeReducer from './themeSlice';
import popupReducer from './popupSlice';
import roomReducer from './roomSlice';
import authReducer from './authSlice';
import gameReducer from './gameSlice';

const rootReducer = combineReducers({
  theme: themeReducer,
  popup: popupReducer,
  auth: authReducer,
  room: roomReducer,
  game: gameReducer
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'theme'] // Persist both auth and theme states
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

export const persistor = persistStore(store);
export default store;