import React from 'react';
import { useSelector } from 'react-redux';
import { useLoginFormLogic } from '../hooks/useLoginFormLogic';
import themeStyles from '../../../utils/themeStyles';

/**
 * Login Form component following Single Responsibility Principle
 * Handles email/password login form with original design
 */
export const LoginForm = ({ inputsRef }) => {
  const theme = useSelector((state) => state.theme.current);
  const currentTheme = themeStyles[theme];
  const {
    formData,
    handleInputChange,
    handleSubmit,
    isLoading,
    errors
  } = useLoginFormLogic();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className={`block text-sm font-medium mb-2 ${currentTheme.text}`}>
            Email
          </label>
          <input
            ref={(el) => inputsRef && (inputsRef.current[0] = el)}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className={`
              appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
              focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
              ${currentTheme.input}
            `}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className={`block text-sm font-medium mb-2 ${currentTheme.text}`}>
            Password
          </label>
          <input
            ref={(el) => inputsRef && (inputsRef.current[1] = el)}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleInputChange}
            className={`
              appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
              focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
              ${currentTheme.input}
            `}
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>
      </div>

      {errors.submit && (
        <p className="text-red-500 text-sm text-center">{errors.submit}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`
          group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md 
          text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
          focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200
        `}
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>

      <div className="text-center">
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Don't have an account?{' '}
          <a 
            href="/register" 
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            Sign up here
          </a>
        </p>
      </div>
    </form>
  );
}; 