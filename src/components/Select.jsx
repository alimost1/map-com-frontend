import { forwardRef, useId } from 'react';

export const Select = forwardRef(function Select({ 
  className = '', 
  label,
  error,
  helperText,
  options = [],
  placeholder,
  ...props 
}, ref) {
  const generatedId = useId();
  const id = props.id || generatedId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-dark-700 mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`
          w-full px-4 py-2 border rounded-lg appearance-none
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-500' : 'border-dark-300'}
          ${props.disabled ? 'bg-dark-50 text-dark-500' : 'bg-white'}
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-dark-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';