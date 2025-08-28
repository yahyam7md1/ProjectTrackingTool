import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.ts';

// Modern, elegant badge with subtle depth and transitions
const badgeVariants = cva(
  'inline-flex items-center border rounded-full text-xs font-semibold px-2.5 py-0.5 transition-colors duration-150 ease-in-out',
  {
    variants: {
      variant: {
        // Primary: brand purple with subtle shadow and focus ring
        default:
          'bg-primary text-white border-transparent shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',

        // Success: light green background (using opacity) with readable dark text
        success:
          'bg-success/20 text-success border-transparent shadow-sm',

        // Destructive: light red background with clear dark red text
        destructive:
          'bg-error/20 text-error border-transparent shadow-sm',
          
        // Warning: light yellow background with readable dark text
        warning:
          'bg-yellow-100 text-yellow-800 border-transparent shadow-sm',

        // Outline: subtle border and neutral text
        outline: 'bg-transparent border-text-secondary text-text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
