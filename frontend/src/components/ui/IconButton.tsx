import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const iconButtonVariants = cva(
  'flex items-center justify-center rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-primary-start to-primary-end text-white shadow-sm hover:brightness-95 active:scale-95',
        secondary: 'bg-white border border-gray-200 text-text-primary hover:bg-gray-50 active:scale-95',
        destructive: 'bg-gradient-to-r from-error-start to-error-end text-white shadow-sm hover:brightness-95 active:scale-95',
        ghost: 'bg-transparent text-text-primary hover:bg-gray-100 active:scale-95',
      },
      size: {
        default: 'h-10 w-10',
        sm: 'h-8 w-8',
        lg: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon, 'aria-label': ariaLabel, ...props }, ref) => {
    // Ensure there's an aria-label for accessibility
    if (!ariaLabel && process.env.NODE_ENV === 'development') {
      console.warn('IconButton: Missing aria-label prop. This is important for accessibility.');
    }

    return (
      <button
        ref={ref}
        className={cn(iconButtonVariants({ variant, size }), className)}
        aria-label={ariaLabel}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };
