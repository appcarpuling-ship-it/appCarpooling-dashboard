import { forwardRef } from 'react'
import { clsx } from 'clsx'

const Input = forwardRef(({
  className,
  type = 'text',
  error,
  label,
  description,
  icon,
  ...props
}, ref) => {
  const hasError = !!error

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          ref={ref}
          className={clsx(
            'input',
            icon && 'pl-10',
            hasError && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          {...props}
        />
      </div>

      {description && !hasError && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      {hasError && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input