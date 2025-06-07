import React from 'react';

const NotFound = () => {
  return (
    <div className="h-full flex items-center justify-center text-center py-20">
      <div>
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">Page Not Found</p>
        <a href="/" className="text-blue-500 hover:underline mt-4 inline-block">
          Go Home
        </a>
      </div>
    </div>
  );
};

/**
 * Not Found Page component following Single Responsibility Principle
 * Displays 404 error page with proper theme integration
 */
export const NotFoundPage = () => {
  return <NotFound />;
}; 