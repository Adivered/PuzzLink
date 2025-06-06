import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../../../components/auth/LoginForm';
import GoogleSignInButton from '../../../components/auth/GoogleSignInButton';
import useAuth from '../../../hooks/useAuth';
import useLoginAnimation from '../../../hooks/animations/useLoginAnimation';
import themeStyles from '../../../utils/themeStyles';
import useIsomorphicLayoutEffect from '../../../hooks/useIsomorphicLayoutEffect';
import CenteredLoader from '../../../components/common/LoadingSpinner';

const Login = () => {
  const theme = useSelector((state) => state.theme.current);
  const { isAuthenticated } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const { handleGoogleLogin } = useAuth();
  const { formRef, titleRef, googleButtonRef, dividerRef, inputsRef } = useLoginAnimation();
  const from = location.state?.from?.pathname || "/";
  const currentTheme = themeStyles[theme];

  useIsomorphicLayoutEffect(() => {
    if (isAuthenticated) {
      navigate(from);
    }
  }, [isAuthenticated, navigate, from]);

  // Show loading if user is authenticated (will redirect)
  if (isAuthenticated) {
    return <CenteredLoader statusText="Redirecting..." />;
  }

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 ${currentTheme.background}`}>
      <div 
        ref={formRef}
        className={`max-w-md w-full p-8 ${currentTheme.card} rounded-2xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl flex flex-col justify-center`}
      >
        <div ref={titleRef} className="space-y-2 mb-8">
          <h2 className={`text-4xl font-bold ${currentTheme.text} text-center`}>
            Welcome Back
          </h2>
          <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Sign in to continue to your account
          </p>
        </div>
        
        <div ref={googleButtonRef}>
          <GoogleSignInButton onClick={handleGoogleLogin} theme={currentTheme} />
        </div>

        <div ref={dividerRef} className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-4 ${currentTheme.card} ${currentTheme.text}`}>Or continue with email</span>
          </div>
        </div>

        <LoginForm inputsRef={inputsRef} theme={currentTheme} />
      </div>
    </div>
  );
}

export default Login;