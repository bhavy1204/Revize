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
        <label
          htmlFor={id}
          className={`block text-xs font-medium mb-1.5 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      <input
        autoComplete='taskName'
        type={type}
        id={id}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${className}`}
        {...(isFile ? {} : { value: value ?? "" })}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        {...(isFile && accept ? { accept } : {})}
      />
    </div>
  );
};

export default InputField;