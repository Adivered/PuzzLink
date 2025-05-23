import { createSlice } from "@reduxjs/toolkit";

const toastSlice = createSlice({
  name: "toast",
  initialState: {
    toasts: [],
  },
  reducers: {
    addToast: (state, action) => {
      const { message, type } = action.payload;
      const id = Date.now();
      state.toasts.push({ id, message, type });
      // Automatically remove the toast after 3 seconds
      setTimeout(() => {
        state.toasts = state.toasts.filter((toast) => toast.id !== id);
      }, 3000);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;