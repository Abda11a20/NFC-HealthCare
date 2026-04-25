import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// ============================================================================
// Input Component
// Forward ref is used so it integrates natively with react-hook-form.
// Displays optional error messages below the input.
// ============================================================================

export const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  id, 
  ...props 
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  const [showPassword, setShowPassword] = useState(false);
  const isPassword = props.type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : props.type;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      
      {/* Input Field Wrapper */}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          className={`
            flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm
            placeholder:text-slate-400 focus:outline-none focus:ring-2 
            focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50
            transition-shadow ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300'}
          `}
          {...props}
          type={inputType}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      
      {/* Validation Error Message */}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
