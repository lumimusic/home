import { forwardRef } from 'react'
import { clsx } from 'clsx'

const Card = forwardRef(({ 
  children, 
  variant = 'default',
  hover = false,
  glass = false,
  className,
  ...props 
}, ref) => {
  const baseClasses = 'rounded-aurora overflow-hidden'
  
  const variants = {
    default: 'bg-background-surface border border-white/10',
    glass: 'glass',
    elevated: 'bg-background-surface shadow-aurora-soft',
    flat: 'bg-background-surface',
  }
  
  const hoverClasses = hover ? 'hover-lift cursor-pointer' : ''
  const glassClasses = glass ? 'glass' : ''
  
  const classes = clsx(
    baseClasses,
    variants[variant],
    hoverClasses,
    glassClasses,
    className
  )
  
  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  )
})

Card.displayName = 'Card'

// Card sub-components
const CardHeader = forwardRef(({ children, className, ...props }, ref) => (
  <div ref={ref} className={clsx('p-6 pb-0', className)} {...props}>
    {children}
  </div>
))

const CardContent = forwardRef(({ children, className, ...props }, ref) => (
  <div ref={ref} className={clsx('p-6', className)} {...props}>
    {children}
  </div>
))

const CardFooter = forwardRef(({ children, className, ...props }, ref) => (
  <div ref={ref} className={clsx('p-6 pt-0', className)} {...props}>
    {children}
  </div>
))

CardHeader.displayName = 'CardHeader'
CardContent.displayName = 'CardContent'
CardFooter.displayName = 'CardFooter'

Card.Header = CardHeader
Card.Content = CardContent
Card.Footer = CardFooter

export default Card

