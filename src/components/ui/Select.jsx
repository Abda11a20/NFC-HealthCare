import React, { forwardRef } from 'react';

// ============================================================================
// Select Component
// Native HTML select with consistent styling.
// Integrated with react-hook-form using forwardRef.
// ============================================================================

export const Select = forwardRef(({ 
  label, 
  error, 
  options = [], 
  className = '', 
  id, 
  placeholder,
  ...props 
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {/* Label */}
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      
      {/* Select Field */}
      <select
        ref={ref}
        id={selectId}
        className={`
          flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-primary/50 
          disabled:cursor-not-allowed disabled:opacity-50 transition-shadow
          ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300'}
        `}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      
      {/* Validation Error */}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
