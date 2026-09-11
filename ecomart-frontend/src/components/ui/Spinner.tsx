import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex justify-center items-center py-6 ${className}`}>
      <div
        className={`animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600 ${sizes[size]}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Đang tải...</span>
      </div>
    </div>
  );
};

export default Spinner;
