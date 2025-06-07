import { createSlice } from '@reduxjs/toolkit';

const loadInitialTheme = () => {
  try {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme ? JSON.parse(storedTheme) : 'light'; // Default to 'light' theme
  } catch {
    return 'light';
  }
};

const initialState = {
  current: loadInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.current = state.current === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', JSON.stringify(state.current));
    },
    setTheme: (state, action) => {
      state.current = action.payload;
      localStorage.setItem('theme', JSON.stringify(state.current));
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;