import { createSlice } from "@reduxjs/toolkit";

const toastSlice = createSlice({
  name: "toast",
  initialState: {
    toasts: [],
  },
  reducers: {
    addToast: (state, action) => {
      const { message, type, duration = 5000 } = action.payload;
      const id = Date.now() + Math.random(); // More unique ID
      state.toasts.push({ 
        id, 
        message, 
        type, 
        timestamp: new Date().toISOString(),
        duration 
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    clearAllToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { addToast, removeToast, clearAllToasts } = toastSlice.actions;
export default toastSlice.reducer;