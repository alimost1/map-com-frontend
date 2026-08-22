import { forwardRef, useId } from 'react';

export const Input = forwardRef(function Input({ 
  className = '', 
  label,
  error,
  helperText,
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
      <input
        ref={ref}
        id={id}
        className={`
          w-full px-4 py-2 border rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-500' : 'border-dark-300'}
          ${props.disabled ? 'bg-dark-50 text-dark-500' : 'bg-white'}
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${id}-helper`} className="mt-1 text-sm text-dark-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';