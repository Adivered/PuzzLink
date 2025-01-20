import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, clearError } from '../../store/authSlice';

const LoginForm = ({ inputsRef, theme }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const [credentials, setCredentials] = React.useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(loginUser(credentials));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="text-red-500 text-sm text-center p-3 rounded-lg bg-red-500/10">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div ref={el => inputsRef.current[0] = el}>
          <input
            type="email"
            required
            autoComplete='email'
            className={`w-full px-4 py-3 ${theme.input} rounded-xl transition-all duration-200 placeholder-gray-400`}
            placeholder="Email address"
            value={credentials.email}
            onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
        
        <div ref={el => inputsRef.current[1] = el}>
          <input
            type="password"
            required
            autoComplete='current-password'
            className={`w-full px-4 py-3 ${theme.input} rounded-xl transition-all duration-200 placeholder-gray-400`}
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-4 ${theme.button} rounded-xl text-white font-medium transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}

export default LoginForm;

