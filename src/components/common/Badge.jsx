import { clsx } from 'clsx'

const Badge = ({
  children,
  variant = 'default',
  size = 'default',
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full'

  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    default: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

// Status badge component for common statuses
const StatusBadge = ({ status, className, ...props }) => {
  const statusConfig = {
    // Trip statuses
    active: { variant: 'success', text: 'Activo' },
    completed: { variant: 'default', text: 'Completado' },
    cancelled: { variant: 'danger', text: 'Cancelado' },

    // Booking statuses
    pending: { variant: 'warning', text: 'Pendiente' },
    confirmed: { variant: 'success', text: 'Confirmado' },
    rejected: { variant: 'danger', text: 'Rechazado' },

    // Payment statuses
    paid: { variant: 'success', text: 'Pagado' },
    unpaid: { variant: 'danger', text: 'Sin pagar' },
    processing: { variant: 'warning', text: 'Procesando' },

    // User statuses
    verified: { variant: 'success', text: 'Verificado' },
    unverified: { variant: 'warning', text: 'Sin verificar' },
    blocked: { variant: 'danger', text: 'Bloqueado' },

    // General
    online: { variant: 'success', text: 'En línea' },
    offline: { variant: 'default', text: 'Desconectado' },
  }

  const config = statusConfig[status] || { variant: 'default', text: status }

  return (
    <Badge
      variant={config.variant}
      className={className}
      {...props}
    >
      {config.text}
    </Badge>
  )
}

Badge.Status = StatusBadge

export default Badge