import { clsx } from 'clsx'

const Table = ({ children, className, ...props }) => {
  return (
    <div className="overflow-x-auto">
      <table
        className={clsx('min-w-full divide-y divide-gray-200', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

const TableHeader = ({ children, className, ...props }) => {
  return (
    <thead className={clsx('bg-gray-50', className)} {...props}>
      {children}
    </thead>
  )
}

const TableBody = ({ children, className, ...props }) => {
  return (
    <tbody
      className={clsx('bg-white divide-y divide-gray-200', className)}
      {...props}
    >
      {children}
    </tbody>
  )
}

const TableRow = ({ children, className, hover = true, ...props }) => {
  return (
    <tr
      className={clsx(hover && 'hover:bg-gray-50 transition-colors', className)}
      {...props}
    >
      {children}
    </tr>
  )
}

const TableHead = ({ children, className, sortable = false, ...props }) => {
  return (
    <th
      className={clsx(
        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        sortable && 'cursor-pointer hover:text-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

const TableCell = ({ children, className, ...props }) => {
  return (
    <td
      className={clsx('px-6 py-4 whitespace-nowrap text-sm text-gray-900', className)}
      {...props}
    >
      {children}
    </td>
  )
}

// Empty state component
const TableEmpty = ({ message = 'No hay datos disponibles', icon, className }) => {
  return (
    <tr>
      <td colSpan="100%" className={clsx('px-6 py-12 text-center', className)}>
        <div className="flex flex-col items-center justify-center text-gray-500">
          {icon && <div className="mb-4 text-gray-400">{icon}</div>}
          <p className="text-sm">{message}</p>
        </div>
      </td>
    </tr>
  )
}

Table.Header = TableHeader
Table.Body = TableBody
Table.Row = TableRow
Table.Head = TableHead
Table.Cell = TableCell
Table.Empty = TableEmpty

export default Table