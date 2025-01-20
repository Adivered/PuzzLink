import React from 'react';
import { useSelector } from 'react-redux';

const GoogleSignInButton = ({ onClick, theme }) => {
  const { loading } = useSelector(state => state.auth);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center px-4 py-3 mb-6 border border-gray-300/30 rounded-xl ${theme.card} transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${theme.text}`}
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
}

export default GoogleSignInButton;

