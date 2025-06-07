import React from 'react';

// Feature Components
import { RegisterForm } from '../components/RegisterForm';
import { LoginLayout } from '../components/LoginLayout';

// Feature Hooks
import { useRegisterLogic } from '../hooks/useRegisterLogic';

// Shared Components
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';

/**
 * Register Page component following Single Responsibility Principle
 * Handles user registration with form validation
 */
export const RegisterPage = () => {
  const { isAuthenticated, handleSubmit, formData, setFormData, error, isLoading } = useRegisterLogic();

  // Show loading if user is authenticated (will redirect)
  if (isAuthenticated) {
    return <LoadingSpinner statusText="Redirecting..." />;
  }

  return (
    <LoginLayout>
      <div className="space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-center">
          Create your account
        </h2>
      </div>
      
      <RegisterForm
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        error={error}
        isLoading={isLoading}
      />
    </LoginLayout>
  );
}; 