import React from 'react';
import { useThemeManager } from '../../../shared/hooks/useThemeManager';

/**
 * Register Form component following Single Responsibility Principle
 * Handles registration form UI with validation feedback
 */
export const RegisterForm = ({ onSubmit, formData, setFormData, error, isLoading }) => {
  const { theme } = useThemeManager();

  const inputClasses = `appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
    theme === 'dark'
      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
      : 'border-gray-300 bg-white text-gray-900'
  }`;

  const buttonClasses = `group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
    isLoading
      ? 'bg-gray-400 cursor-not-allowed'
      : 'bg-indigo-600 hover:bg-indigo-700'
  }`;

  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
      {error && (
        <div className="text-red-500 text-sm text-center">
          {error}
        </div>
      )}
      
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <input
            type="email"
            required
            className={`${inputClasses} rounded-t-md`}
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              email: e.target.value
            }))}
          />
        </div>
        <div>
          <input
            type="password"
            required
            className={inputClasses}
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              password: e.target.value
            }))}
          />
        </div>
        <div>
          <input
            type="password"
            required
            className={`${inputClasses} rounded-b-md`}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              confirmPassword: e.target.value
            }))}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={buttonClasses}
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </div>
    </form>
  );
}; 