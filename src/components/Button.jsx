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
  icon,
  onClick,
  style,
  ...props
}) => {
  // Base classes that all buttons share
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Variant classes (using explicit hex / brand colors to ensure reliable rendering)
  const variantClasses = {
    primary: 'bg-[#FF6F22] text-white hover:bg-[#E65C10] focus:ring-[#FF6F22]',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-200 border border-gray-200',
    outline: 'bg-white border border-gray-300 hover:bg-gray-100 focus:ring-[#FF6F22]',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  // Combine classes
  const classes = `${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${widthClass} ${className}`;

  // Safely render icon whether passed as JSX element or React component
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return <span className="mr-2 inline-flex items-center justify-center shrink-0">{icon}</span>;
    }
    const IconComp = icon;
    return (
      <span className="mr-2 inline-flex items-center justify-center shrink-0">
        <IconComp className="h-4 w-4" />
      </span>
    );
  };

  const getTextColor = () => {
    if (variant === 'primary' || variant === 'danger' || variant === 'success') return '#FFFFFF';
    if (variant === 'outline' || variant === 'secondary' || variant === 'ghost') return '#000000';
    return '#000000';
  };

  const textColor = getTextColor();

  return (
    <button
      type={type}
      className={classes}
      style={{
        color: textColor,
        ...style,
      }}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && (
        <FaSpinner className="animate-spin mr-2 h-4 w-4 shrink-0" />
      )}
      {!isLoading && renderIcon()}
      {children && (
        <span
          style={{
            color: textColor,
            display: 'inline-block',
            opacity: 1,
            visibility: 'visible',
            fontWeight: 600,
          }}
        >
          {children}
        </span>
      )}
    </button>
  );
};

export default Button;
