import React from 'react';
import { cn } from '../../utils/cn.ts';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('text-sm font-medium text-text-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
        {...props}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';

export default Label;
