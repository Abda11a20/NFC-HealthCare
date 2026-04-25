import React from 'react';
import { Loader2 } from 'lucide-react';

// ============================================================================
// Button Component
// Supports loading states, standard variants, and sizes for consistency.
// ============================================================================

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  disabled = false, 
  className = '', 
  ...props 
}) => {
  // Base classes ensure flex alignment and transitions
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  
  // Design variants
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-300/50',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary/50',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50',
  };

  // Sizes
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Show a spinner from lucide-react if loading is true */}
      {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
      {children}
    </button>
  );
};
