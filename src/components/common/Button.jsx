import { forwardRef } from 'react'
import { clsx } from 'clsx'

const Button = forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  icon,
  ...props
}, ref) => {
  const baseClasses = 'btn'

  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    warning: 'btn-warning',
    danger: 'btn-danger',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100',
    link: 'text-primary-600 hover:text-primary-700 underline bg-transparent shadow-none',
  }

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    default: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
  }

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export default Button