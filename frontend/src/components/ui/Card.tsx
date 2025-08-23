import React from 'react';
import { cn } from '../../utils/cn.ts';

// Define interfaces for props
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  topAccent?: boolean;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

// Main Card container
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, topAccent = true, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('relative rounded-xl', className)} {...props}>
        {topAccent && (
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary-start to-primary-end rounded-t-xl" />
        )}
        <div className={cn('bg-white rounded-xl shadow-lg border border-gray-100')}>{children}</div>
      </div>
    );
  }
);
Card.displayName = 'Card';

// CardHeader: padding and vertical spacing for Title + Description
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6 space-y-1', className)} {...props}>
        {children}
      </div>
    );
  }
);
CardHeader.displayName = 'CardHeader';

// CardTitle: prominent, bold, centered h3
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3 ref={ref} className={cn('text-2xl font-semibold text-center text-text-primary', className)} {...props}>
        {children}
      </h3>
    );
  }
);
CardTitle.displayName = 'CardTitle';

// CardDescription: smaller, secondary, centered paragraph
const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p ref={ref} className={cn('text-sm text-text-secondary text-center', className)} {...props}>
        {children}
      </p>
    );
  }
);
CardDescription.displayName = 'CardDescription';

// CardContent: main area for form content. padding but no top padding
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6 pt-0', className)} {...props}>
        {children}
      </div>
    );
  }
);
CardContent.displayName = 'CardContent';

// CardFooter: footer area (actions) with matching padding
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6 pt-0 border-t border-gray-100', className)} {...props}>
        {children}
      </div>
    );
  }
);
CardFooter.displayName = 'CardFooter';

// TypeScript interface for the Card component with attached subcomponents
export interface CardComponent extends React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>> {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Description: typeof CardDescription;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
}

// Cast Card to CardComponent to add subcomponents
(Card as CardComponent).Header = CardHeader;
(Card as CardComponent).Title = CardTitle;
(Card as CardComponent).Description = CardDescription;
(Card as CardComponent).Content = CardContent;
(Card as CardComponent).Footer = CardFooter;

// Export Card as CardComponent with the subcomponents
export { 
  Card as Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
};
