import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Table, Button, Input, Modal, Badge, Loading } from '../components/common'
import { notificationService } from '../services'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import {
  Bell,
  Search,
  Eye,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Mail,
  MailOpen,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  User,
  Car,
  DollarSign
} from 'lucide-react'

const Notifications = () => {
  const [filters, setFilters] = useState({
    search: '',
    read: '',
    type: '',
    page: 1,
    limit: 20
  })
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const queryClient = useQueryClient()

  // Fetch notifications with filters
  const { data: notificationsData, isLoading, error } = useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationService.getAll(filters),
    keepPreviousData: true
  })

  // Fetch unread count
  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationService.getUnreadCount()
  })

  // Mutations
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
      queryClient.invalidateQueries(['notifications-unread-count'])
      toast.success('Todas las notificaciones marcadas como leídas')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al marcar notificaciones como leídas')
    }
  })

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
      queryClient.invalidateQueries(['notifications-unread-count'])
      toast.success('Notificación marcada como leída')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al marcar notificación como leída')
    }
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: notificationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
      queryClient.invalidateQueries(['notifications-unread-count'])
      toast.success('Notificación eliminada')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar notificación')
    }
  })

  const clearReadMutation = useMutation({
    mutationFn: notificationService.clearRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
      toast.success('Notificaciones leídas eliminadas')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar notificaciones leídas')
    }
  })

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const viewNotificationDetails = (notification) => {
    setSelectedNotification(notification)
    setShowNotificationModal(true)

    // Mark as read if unread
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id)
    }
  }

  const handleMarkAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId)
  }

  const handleDeleteNotification = (notificationId) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      deleteNotificationMutation.mutate(notificationId)
    }
  }

  const handleClearRead = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todas las notificaciones leídas?')) {
      clearReadMutation.mutate()
    }
  }

  const getTypeIcon = (type) => {
    const typeConfig = {
      booking: { icon: Car, color: 'text-blue-600', bg: 'bg-blue-100' },
      payment: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
      trip: { icon: Car, color: 'text-purple-600', bg: 'bg-purple-100' },
      user: { icon: User, color: 'text-orange-600', bg: 'bg-orange-100' },
      commission: { icon: DollarSign, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      system: { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-100' }
    }

    const config = typeConfig[type] || typeConfig.system
    const IconComponent = config.icon

    return (
      <div className={`p-2 rounded-full ${config.bg}`}>
        <IconComponent className={`w-4 h-4 ${config.color}`} />
      </div>
    )
  }

  const getTypeBadge = (type) => {
    const typeConfig = {
      booking: { variant: 'primary', label: 'Reserva' },
      payment: { variant: 'success', label: 'Pago' },
      trip: { variant: 'info', label: 'Viaje' },
      user: { variant: 'warning', label: 'Usuario' },
      commission: { variant: 'secondary', label: 'Comisión' },
      system: { variant: 'default', label: 'Sistema' }
    }

    const config = typeConfig[type] || typeConfig.system
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const notifications = notificationsData?.data || []
  const pagination = {
    total: notificationsData?.total || 0,
    currentPage: notificationsData?.page || 1,
    totalPages: notificationsData?.pages || 1,
    count: notificationsData?.count || 0
  }
  const unreadCount = unreadData?.unreadCount || 0

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
        <Card className="p-6">
          <p className="text-red-600">Error al cargar notificaciones: {error.message}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          {unreadCount > 0 && (
            <Badge variant="danger" className="px-2 py-1">
              {unreadCount} sin leer
            </Badge>
          )}
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={handleClearRead}
            loading={clearReadMutation.isLoading}
          >
            Limpiar Leídas
          </Button>
          <Button
            variant="primary"
            icon={<CheckCheck className="w-4 h-4" />}
            onClick={() => markAllAsReadMutation.mutate()}
            loading={markAllAsReadMutation.isLoading}
            disabled={unreadCount === 0}
          >
            Marcar Todas Leídas
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar notificaciones..."
              value={filters.search}
              onChange={handleSearch}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button
            variant="outline"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.read}
                onChange={(e) => handleFilterChange('read', e.target.value)}
              >
                <option value="">Todas</option>
                <option value="false">No leídas</option>
                <option value="true">Leídas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="booking">Reserva</option>
                <option value="payment">Pago</option>
                <option value="trip">Viaje</option>
                <option value="user">Usuario</option>
                <option value="commission">Comisión</option>
                <option value="system">Sistema</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Elementos por página
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Notifications List */}
      <Card>
        <Card.Header>
          <Card.Title>
            Notificaciones ({notifications.length})
          </Card.Title>
        </Card.Header>
        <Card.Content className="p-0">
          {isLoading ? (
            <div className="p-8">
              <Loading.TableSkeleton rows={5} />
            </div>
          ) : notifications.length > 0 ? (
            <>
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => viewNotificationDetails(notification)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getTypeIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h3 className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h3>
                            {getTypeBadge(notification.type)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                            </span>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </div>

                        <p className={`mt-1 text-sm ${
                          !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {notification.message}
                        </p>
                      </div>

                      <div className="flex-shrink-0 flex space-x-1">
                        {!notification.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<MailOpen className="w-3 h-3" />}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notification._id)
                            }}
                            loading={markAsReadMutation.isLoading}
                            title="Marcar como leída"
                          />
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Trash2 className="w-3 h-3" />}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteNotification(notification._id)
                          }}
                          loading={deleteNotificationMutation.isLoading}
                          title="Eliminar notificación"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                      Mostrando {((pagination.currentPage - 1) * pagination.limit) + 1} a{' '}
                      {Math.min(pagination.currentPage * pagination.limit, pagination.total)} de{' '}
                      {pagination.total} notificaciones
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.currentPage === 1}
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                      >
                        Anterior
                      </Button>
                      <span className="flex items-center px-3 py-1 text-sm">
                        Página {pagination.currentPage} de {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.currentPage === pagination.totalPages}
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
              <p className="text-sm text-gray-500">No se encontraron notificaciones con los filtros actuales.</p>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Notification Details Modal */}
      <Modal
        isOpen={showNotificationModal}
        onClose={() => {
          setShowNotificationModal(false)
          setSelectedNotification(null)
        }}
        size="lg"
      >
        <Modal.Content>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              {selectedNotification && getTypeIcon(selectedNotification.type)}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedNotification?.title}
                </h3>
                {selectedNotification && getTypeBadge(selectedNotification.type)}
              </div>
            </div>

            {selectedNotification && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Mensaje</h4>
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {selectedNotification.message}
                  </p>
                </div>

                {selectedNotification.actionUrl && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Acción</h4>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        window.open(selectedNotification.actionUrl, '_blank')
                      }}
                    >
                      Ir a la acción
                    </Button>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Fecha:</span>
                      <p className="font-medium">
                        {format(new Date(selectedNotification.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Estado:</span>
                      <p className="font-medium">
                        {selectedNotification.isRead ? 'Leída' : 'No leída'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal.Content>
        <Modal.Footer>
          <Button
            variant="outline"
            onClick={() => {
              setShowNotificationModal(false)
              setSelectedNotification(null)
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Notifications