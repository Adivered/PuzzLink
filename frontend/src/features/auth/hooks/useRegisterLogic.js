import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser } from '../../../app/store/authSlice';
import { addToast } from '../../../app/store/toastSlice';
import useIsomorphicLayoutEffect from '../../../hooks/useIsomorphicLayoutEffect';
import axios from 'axios';

/**
 * Register logic hook following Single Responsibility Principle
 * Handles registration form state, validation, and API calls
 */
export const useRegisterLogic = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Redirect if already authenticated
  useIsomorphicLayoutEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    try {
      // Register user first
      const response = await axios.post('/auth/register', {
        email: formData.email,
        password: formData.password
      });
      
      if (response.data) {
        // After successful registration, log the user in
        await dispatch(loginUser({
          email: formData.email,
          password: formData.password
        })).unwrap();
        
        dispatch(addToast({
          message: 'Registration successful! Welcome to Zoo!',
          type: 'success'
        }));
        
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      setError(errorMessage);
      dispatch(addToast({
        message: errorMessage,
        type: 'error'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAuthenticated,
    handleSubmit,
    formData,
    setFormData,
    error,
    isLoading,
  };
}; 