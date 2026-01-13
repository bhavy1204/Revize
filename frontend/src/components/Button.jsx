import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  className = '',
  variant = 'primary', // 'primary', 'secondary', 'danger', 'success'
  disabled = false,
}) => {
  const baseStyles = "font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline";
  let variantStyles = '';

  switch (variant) {
    case 'primary':
      variantStyles = 'bg-blue-500 hover:bg-blue-700 text-white';
      break;
    case 'secondary':
      variantStyles = 'bg-gray-600 hover:bg-gray-500 text-white';
      break;
    case 'danger':
      variantStyles = 'bg-red-600 hover:bg-red-700 text-white';
      break;
    case 'success':
      variantStyles = 'bg-green-500 hover:bg-green-700 text-white';
      break;
    default:
      variantStyles = 'bg-blue-500 hover:bg-blue-700 text-white';
  }

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${disabledStyles} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;