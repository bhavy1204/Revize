import React from 'react';

const InputField = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder = '',
  className = '',
  labelClassName = 'text-gray-700', // Default color, can be overridden
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className={`block text-sm font-bold mb-2 ${labelClassName}`}>
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${className}`}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
};

export default InputField;