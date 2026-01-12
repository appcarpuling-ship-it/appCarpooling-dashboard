import { clsx } from 'clsx'

const Loading = ({
  size = 'default',
  text,
  className,
  center = false,
  fullScreen = false,
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  const textSizes = {
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }

  const spinner = (
    <div className={clsx('animate-spin rounded-full border-b-2 border-primary-600', sizes[size])} />
  )

  const content = (
    <div className={clsx('flex items-center gap-3', center && 'justify-center', className)}>
      {spinner}
      {text && (
        <span className={clsx('text-gray-600', textSizes[size])}>{text}</span>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}

// Skeleton loader component
const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={clsx('animate-pulse bg-gray-200 rounded', className)}
      {...props}
    />
  )
}

// Card skeleton
const CardSkeleton = ({ className }) => {
  return (
    <div className={clsx('card p-6 space-y-4', className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
}

// Table skeleton
const TableSkeleton = ({ rows = 5, cols = 4, className }) => {
  return (
    <div className={clsx('space-y-3', className)}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4">
          {[...Array(cols)].map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

Loading.Skeleton = Skeleton
Loading.CardSkeleton = CardSkeleton
Loading.TableSkeleton = TableSkeleton

export default Loading