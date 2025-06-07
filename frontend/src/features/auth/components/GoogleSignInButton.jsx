import React from 'react';
import { useSelector } from 'react-redux';
import themeStyles from '../../../utils/themeStyles';

/**
 * Google Sign-In Button component following Single Responsibility Principle
 * Handles Google authentication with original styling
 */
export const GoogleSignInButton = ({ onClick }) => {
  const theme = useSelector((state) => state.theme.current);
  const { loading } = useSelector(state => state.auth);
  const currentTheme = themeStyles[theme];

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center px-4 py-3 mb-6 border border-gray-300/30 rounded-xl ${currentTheme.card} transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${currentTheme.text}`}
      disabled={loading}
    >
      <img
        className="h-5 w-5 mr-3"
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google logo"
      />
      Continue with Google
    </button>
  );
}; 