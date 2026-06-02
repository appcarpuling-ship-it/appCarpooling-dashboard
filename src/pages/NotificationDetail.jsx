import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Badge, Button } from '../components/common'
import { notificationService } from '../services'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { ArrowLeft, Bell, Car, DollarSign, User, MailOpen, Trash2 } from 'lucide-react'

const Field = ({ label, value }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500">{label}</label>
    <div className="mt-0.5 text-sm text-gray-900">{value ?? 'N/A'}</div>
  </div>
)

const typeConfig = {
  booking_created: { icon: Car, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Reserva creada' },
  booking_confirmed: { icon: Car, color: 'text-green-600', bg: 'bg-green-100', label: 'Reserva confirmada' },
  booking_cancelled: { icon: Car, color: 'text-red-600', bg: 'bg-red-100', label: 'Reserva cancelada' },
  trip_cancelled: { icon: Car, color: 'text-red-600', bg: 'bg-red-100', label: 'Viaje cancelado' },
  trip_completed: { icon: Car, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Viaje completado' },
  trip_reminder: { icon: Car, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Recordatorio de viaje' },
  trip_started: { icon: Car, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Viaje iniciado' },
  payment_received: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', label: 'Pago recibido' },
  payment_completed: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', label: 'Pago completado' },
  payment_failed: { icon: DollarSign, color: 'text-red-600', bg: 'bg-red-100', label: 'Pago fallido' },
  profile_verified: { icon: User, color: 'text-green-600', bg: 'bg-green-100', label: 'Perfil verificado' },
  new_message: { icon: Bell, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Nuevo mensaje' },
  review_received: { icon: User, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Reseña recibida' },
  admin: { icon: Bell, color: 'text-gray-700', bg: 'bg-gray-200', label: 'Admin' },
  promotional: { icon: Bell, color: 'text-pink-600', bg: 'bg-pink-100', label: 'Promocional' },
  general: { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-100', label: 'General' },
}

const NotificationDetail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const notification = location.state?.notification

  const markAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAsRead(notification._id),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  })

  const deleteMutation = useMutation({
    mutationFn: () => notificationService.delete(notification._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
      toast.success('Notificación eliminada')
      navigate('/notifications')
    },
    onError: () => toast.error('Error al eliminar notificación'),
  })

  useEffect(() => {
    if (notification && !notification.isRead) {
      markAsReadMutation.mutate()
    }
  }, [])

  if (!notification) {
    return (
      <div className="space-y-4">
        <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/notifications')}>Volver</Button>
        <Card className="p-6"><p className="text-gray-500">No se encontró información de la notificación.</p></Card>
      </div>
    )
  }

  const tc = typeConfig[notification.type] || typeConfig.general
  const IconComponent = tc.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/notifications')}>
          Volver a notificaciones
        </Button>
        <div className="flex gap-2">
          {!notification.isRead && (
            <Button variant="outline" size="sm" icon={<MailOpen className="w-4 h-4" />} onClick={() => markAsReadMutation.mutate()} loading={markAsReadMutation.isLoading}>
              Marcar leída
            </Button>
          )}
          <Button variant="outline" size="sm" icon={<Trash2 className="w-4 h-4" />} onClick={() => deleteMutation.mutate()} loading={deleteMutation.isLoading}>
            Eliminar
          </Button>
        </div>
      </div>

      {/* Contenido principal */}
      <Card>
        <Card.Content className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full flex-shrink-0 ${tc.bg}`}>
              <IconComponent className={`w-6 h-6 ${tc.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="default">{tc.label}</Badge>
                {!notification.isRead && <Badge variant="info">Sin leer</Badge>}
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-3">{notification.title}</h1>
              <p className="text-gray-700 leading-relaxed text-base">{notification.message}</p>
            </div>
          </div>

          {notification.actionUrl && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <a href={notification.actionUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm">Ir a la acción</Button>
              </a>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Metadatos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header><Card.Title>Detalles</Card.Title></Card.Header>
          <Card.Content className="p-6 space-y-3">
            <Field label="Tipo" value={notification.type} />
            <Field label="Estado" value={notification.isRead ? `✓ Leída (${notification.readAt ? format(new Date(notification.readAt), 'dd/MM/yyyy HH:mm', { locale: es }) : '—'})` : '✗ Sin leer'} />
            <Field label="Creada" value={notification.createdAt ? format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'} />
            <Field label="Promocional" value={notification.isPromotion ? 'Sí' : 'No'} />
            <Field label="ID" value={<span className="font-mono text-xs break-all">{notification._id}</span>} />
          </Card.Content>
        </Card>

        {/* Referencias */}
        {(notification.relatedTrip || notification.relatedBooking || notification.relatedUser) && (
          <Card>
            <Card.Header><Card.Title>Referencias</Card.Title></Card.Header>
            <Card.Content className="p-6 space-y-3">
              {notification.relatedTrip && (
                <div>
                  <Field label="Viaje relacionado" value={<span className="font-mono text-xs">{notification.relatedTrip?._id || notification.relatedTrip}</span>} />
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate(`/trips/${notification.relatedTrip?._id || notification.relatedTrip}`)}>
                    Ver viaje
                  </Button>
                </div>
              )}
              {notification.relatedBooking && (
                <div>
                  <Field label="Reserva relacionada" value={<span className="font-mono text-xs">{notification.relatedBooking?._id || notification.relatedBooking}</span>} />
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate(`/bookings/${notification.relatedBooking?._id || notification.relatedBooking}`)}>
                    Ver reserva
                  </Button>
                </div>
              )}
              {notification.relatedUser && (
                <div>
                  <Field label="Usuario relacionado" value={<span className="font-mono text-xs">{notification.relatedUser?._id || notification.relatedUser}</span>} />
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate(`/users/${notification.relatedUser?._id || notification.relatedUser}`)}>
                    Ver usuario
                  </Button>
                </div>
              )}
            </Card.Content>
          </Card>
        )}
      </div>
    </div>
  )
}

export default NotificationDetail
