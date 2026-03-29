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
  accept = '',
}) => {
  const isFile = type === 'file';

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
        {...(isFile ? {} : { value: value ?? '' })}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        {...(isFile && accept ? { accept } : {})}
      />
    </div>
  );
};

export default InputField;