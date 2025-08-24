import React from 'react';

interface LoadingErrorProps {
  loading?: boolean;
  error?: string | null;
  children?: React.ReactNode;
}

const LoadingError: React.FC<LoadingErrorProps> = ({ loading = false, error = null, children }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-secondary-800 mb-2">Something went wrong</h3>
          <p className="text-secondary-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary mt-4"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingError;