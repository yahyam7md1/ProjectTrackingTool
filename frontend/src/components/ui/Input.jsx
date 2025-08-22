import React from 'react'
import { cn } from '../../utils/cn'

const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full h-10 rounded-md border border-gray-300 px-3 py-2 placeholder:text-gray-400 bg-white text-text-primary',
        'focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export default Input
