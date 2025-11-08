import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  fullScreen = false,
  message 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Animated spinner */}
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
        <div className={`${sizeClasses[size]} border-4 border-transparent border-t-blue-400 rounded-full animate-spin absolute top-0 left-0`} style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>
      </div>
      
      {/* Pulsing dots */}
      <div className="flex gap-2">
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>

      {message && (
        <p className="text-gray-600 text-sm font-medium animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center z-50 animate-fadeIn">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Skeleton loader for cards
export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      <div className="flex gap-2 mt-4">
        <div className="h-6 w-16 bg-gray-200 rounded"></div>
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

// Skeleton loader for table rows
export const TableRowSkeleton: React.FC = () => {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
    </tr>
  );
};
