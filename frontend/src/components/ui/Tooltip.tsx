import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../utils/cn';

// Create a context provider component to wrap the application
const TooltipProvider = TooltipPrimitive.Provider;

// Define props for our custom Tooltip component
interface TooltipProps {
  /** The element that triggers the tooltip */
  children: React.ReactNode;
  /** The text content to display inside the tooltip */
  text: string;
  /** Optional CSS class name for the tooltip content */
  className?: string;
  /** Delay duration before showing the tooltip (in ms) */
  delayDuration?: number;
  /** The side of the element to show the tooltip */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** The alignment along the side */
  align?: 'start' | 'center' | 'end';
}

const Tooltip = ({
  children,
  text,
  className,
  delayDuration = 300,
  side = 'top',
  align = 'center',
}: TooltipProps) => {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          className={cn(
            // Base styles
            'z-50 overflow-hidden rounded-md bg-text-primary px-3 py-1.5 text-xs text-white shadow-md',
            // Animation styles
            'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-50 data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95',
            className
          )}
          sideOffset={5}
        >
          {text}
          <TooltipPrimitive.Arrow className="fill-text-primary" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
};

// Re-export TooltipProvider for easy app-level configuration
export { Tooltip, TooltipProvider };
