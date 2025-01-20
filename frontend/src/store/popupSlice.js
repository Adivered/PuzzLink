import { createSlice } from '@reduxjs/toolkit';

const loadInitialState = () => {
  try {
    const stored = localStorage.getItem('popupStates');
    return stored ? JSON.parse(stored) : { visiblePopups: {} };
  } catch {
    return { visiblePopups: {} };
  }
};

const initialState = loadInitialState();

const popupSlice = createSlice({
  name: 'popup',
  initialState,
  reducers: {
    closePopup: (state, action) => {
      const { key, persistent } = action.payload;
      state.visiblePopups[key] = false;
      if (persistent) {
        try {
          const currentStates = { ...state.visiblePopups };
          localStorage.setItem('popupStates', JSON.stringify({ visiblePopups: currentStates }));
        } catch {
          // Handle localStorage errors silently
        }
      }
    },
    resetPopup: (state, action) => {
      const key = action.payload;
      state.visiblePopups[key] = true;
      try {
        const currentStates = { ...state.visiblePopups };
        localStorage.setItem('popupStates', JSON.stringify({ visiblePopups: currentStates }));
      } catch {
        // Handle localStorage errors silently
      }
    },
  },
});

export const { closePopup, resetPopup } = popupSlice.actions;

export const selectPopupVisibility = (state, key) => 
  state.popup.visiblePopups[key] ?? true;

export default popupSlice.reducer;