import React from 'react';
import { cn } from '../../utils/cn';

// Main Card container
const Card = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('bg-white rounded-xl shadow-lg border border-gray-100', className)}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = 'Card';

// CardHeader: padding and vertical spacing for Title + Description
const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('p-6 space-y-1', className)} {...props}>
      {children}
    </div>
  );
});
CardHeader.displayName = 'CardHeader';

// CardTitle: prominent, bold, centered h3
const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <h3 ref={ref} className={cn('text-2xl font-semibold text-center text-text-primary', className)} {...props}>
      {children}
    </h3>
  );
});
CardTitle.displayName = 'CardTitle';

// CardDescription: smaller, secondary, centered paragraph
const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <p ref={ref} className={cn('text-sm text-text-secondary text-center', className)} {...props}>
      {children}
    </p>
  );
});
CardDescription.displayName = 'CardDescription';

// CardContent: main area for form content. padding but no top padding
const CardContent = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
});
CardContent.displayName = 'CardContent';

// CardFooter: footer area (actions) with matching padding
const CardFooter = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
});
CardFooter.displayName = 'CardFooter';

// Attach subcomponents to main Card for convenience
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
