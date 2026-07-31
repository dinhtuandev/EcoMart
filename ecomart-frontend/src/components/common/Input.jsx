import React from 'react';

const Input = ({
  label,
  id,
  type = 'text',
  error,
  placeholder,
  value,
  onChange,
  className = '',
  required = false,
  ariaLabel,
  ...props
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={ariaLabel || label || id}
        className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-rose-500 text-rose-900 placeholder-rose-300' : 'border-slate-300 text-slate-900'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-600 mt-0.5">{error}</p>}
    </div>
  );
};

export default Input;
