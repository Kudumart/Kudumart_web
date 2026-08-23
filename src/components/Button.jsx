import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const Button = ({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger, success
  size = 'md', // sm, md, lg
  type = 'button',
  isLoading = false,
  disabled = false,
  className = '',
  fullWidth = false,
  icon: Icon,
  onClick,
  ...props
}) => {
  // Base classes that all buttons share
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  // Variant classes (using standard Tailwind colors, assuming 'primary' is configured in tailwind.config.js)
  const variantClasses = {
    primary: 'bg-primary text-white hover:opacity-90 focus:ring-primary',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-200',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-200',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  // Combine classes
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && (
        <FaSpinner className="animate-spin mr-2 h-4 w-4" />
      )}
      {!isLoading && Icon && (
        <span className="mr-2 flex items-center justify-center">
          <Icon className="h-4 w-4" />
        </span>
      )}
      {children}
    </button>
  );
};

export default Button;
