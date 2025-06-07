import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { clearError, getGoogleAuthUrl } from '../app/store/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const handleGoogleLogin = async () => {
    dispatch(clearError());
    const from = location.state?.from?.pathname || "/";
    const url = await dispatch(getGoogleAuthUrl(from)).unwrap();
    window.location.href = url;
  };

  return { handleGoogleLogin };
}

export default useAuth;

