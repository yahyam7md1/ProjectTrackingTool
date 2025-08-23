import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.ts';

// Enhanced variants with modern look: gradients, shadows, smoother hover/focus
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-transform motion-safe:transform-gpu motion-safe:transition hover:-translate-y-0.5 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:ring-offset-1 disabled:opacity-60 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-primary-start to-primary-end text-white shadow-md hover:brightness-95',
        secondary: 'bg-white border border-gray-200 text-text-primary hover:bg-gray-50',
        destructive: 'bg-gradient-to-r from-error-start to-error-end text-white shadow-sm hover:brightness-95',
        ghost: 'bg-transparent text-text-primary hover:bg-gray-100',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

// Define ButtonProps interface with VariantProps
export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

// Button component now supports: leftIcon, rightIcon, loading
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, leftIcon, rightIcon, loading = false, children, ...props }, ref) => {
    const disabled = loading || props.disabled;

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        aria-busy={loading}
        disabled={disabled}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        )}

        {/* Left icon (not shown while loading) */}
        {!loading && leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}

        <span className={cn(loading ? 'opacity-80' : '')}>{children}</span>

        {/* Right icon */}
        {!loading && rightIcon && <span className="ml-2 inline-flex items-center">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
