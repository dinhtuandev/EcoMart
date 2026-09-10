import React from 'react';
import { Link } from 'react-router-dom';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'autumn' | 'glass' | 'link' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  ariaLabel?: string;
  to?: string;
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ariaLabel,
  to,
  href,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-primary-700 hover:bg-primary-600 text-white font-bold focus:ring-primary-500 shadow-sm border border-primary-600/40',
    secondary:
      'bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold focus:ring-slate-400',
    outline:
      'border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700 font-bold focus:ring-primary-500',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white font-bold focus:ring-rose-500',
    accent:
      'bg-primary-700 hover:bg-primary-600 text-white font-bold shadow-lg shadow-primary-950/40 hover:scale-[1.02] active:scale-95 focus:ring-primary-500 rounded-2xl border border-primary-500/40',
    autumn:
      'bg-autumn-500 hover:bg-autumn-600 text-primary-950 font-black shadow-lg shadow-autumn-500/25 hover:scale-[1.02] active:scale-95 focus:ring-autumn-400 rounded-2xl',
    glass:
      'bg-primary-900/60 hover:bg-primary-800 text-primary-100 border border-primary-700/80 backdrop-blur-md font-bold hover:text-white focus:ring-primary-500 rounded-2xl',
    link:
      'bg-transparent hover:bg-transparent text-primary-700 hover:text-primary-900 font-bold p-0 focus:ring-primary-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-7 py-3.5 text-sm sm:text-base',
  };

  const combinedClasses = `${baseStyles} ${variants[variant]} ${
    variant !== 'link' ? sizes[size] : ''
  } ${className}`;

  const renderContent = () => (
    <>
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Đang xử lý...</span>
        </span>
      ) : (
        children
      )}
    </>
  );

  const ariaValue = ariaLabel || (typeof children === 'string' ? children : 'button');

  if (to && !disabled && !isLoading) {
    return (
      <Link
        to={to}
        aria-label={ariaValue}
        className={combinedClasses}
        onClick={onClick as (e: React.MouseEvent<HTMLAnchorElement>) => void}
      >
        {renderContent()}
      </Link>
    );
  }

  if (href && !disabled && !isLoading) {
    return (
      <a
        href={href}
        aria-label={ariaValue}
        className={combinedClasses}
        onClick={onClick as (e: React.MouseEvent<HTMLAnchorElement>) => void}
      >
        {renderContent()}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick as (e: React.MouseEvent<HTMLButtonElement>) => void}
      aria-label={ariaValue}
      tabIndex={0}
      className={combinedClasses}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;

