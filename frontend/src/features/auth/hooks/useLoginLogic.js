import { useSelector } from 'react-redux';
import useAuth from '../../../hooks/useAuth';

/**
 * Login Logic Hook following Single Responsibility Principle
 * Handles Google authentication logic only
 */
export const useLoginLogic = () => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const { handleGoogleLogin } = useAuth();

  return {
    isAuthenticated,
    handleGoogleLogin,
  };
}; 