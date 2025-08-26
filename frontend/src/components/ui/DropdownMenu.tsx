import React from 'react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '../../utils/cn';

// DropdownMenu Root Component
const DropdownMenu = RadixDropdownMenu.Root;

// DropdownMenu Trigger Component
const DropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Trigger> & { asChild?: boolean }
>(({ className, children, asChild = false, ...props }, ref) => (
  <RadixDropdownMenu.Trigger
    ref={ref}
    asChild={asChild}
    className={cn(
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
      className
    )}
    {...props}
  >
    {children}
  </RadixDropdownMenu.Trigger>
));

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

// DropdownMenu Content Component
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Content>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <RadixDropdownMenu.Portal>
    <RadixDropdownMenu.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-lg animate-in',
        className
      )}
      {...props}
    />
  </RadixDropdownMenu.Portal>
));

DropdownMenuContent.displayName = 'DropdownMenuContent';

// DropdownMenu Item Component
const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Item>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Item>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenu.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  />
));

DropdownMenuItem.displayName = 'DropdownMenuItem';

// DropdownMenu Label Component
const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Label>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Label>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenu.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold text-text-primary', className)}
    {...props}
  />
));

DropdownMenuLabel.displayName = 'DropdownMenuLabel';

// DropdownMenu Separator Component
const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Separator>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Separator>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenu.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-gray-200', className)}
    {...props}
  />
));

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};
