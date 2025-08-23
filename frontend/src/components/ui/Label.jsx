import React from 'react'
import { cn } from '../../utils/cn'

const Label = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn('text-sm font-medium text-text-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
      {...props}
    >
      {children}
    </label>
  )
})

Label.displayName = 'Label'

export default Label
