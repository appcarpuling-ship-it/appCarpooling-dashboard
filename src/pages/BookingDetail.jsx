import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Badge, Button, Loading } from '../components/common'
import { adminService } from '../services'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { ArrowLeft, User, Car, MapPin, Calendar, Clock, X } from 'lucide-react'

const Field = ({ label, value }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500">{label}</label>
    <p className="mt-0.5 text-sm text-gray-900">{value ?? 'N/A'}</p>
  </div>
)

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price ?? 0)

const getStatusBadge = (status) => {
  const map = {
    pending: { variant: 'warning', label: 'Pendiente' },
    confirmed: { variant: 'success', label: 'Confirmada' },
    cancelled: { variant: 'danger', label: 'Cancelada' },
    completed: { variant: 'info', label: 'Completada' },
    rejected: { variant: 'secondary', label: 'Rechazada' },
  }
  const c = map[status] || { variant: 'default', label: status }
  return <Badge variant={c.variant}>{c.label}</Badge>
}

const BookingDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelInput, setShowCancelInput] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-booking', id],
    queryFn: () => adminService.bookings.getById(id),
  })

  const cancelMutation = useMutation({
    mutationFn: () => adminService.bookings.cancel(id, cancelReason),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-booking', id])
      toast.success('Reserva cancelada')
      setShowCancelInput(false)
      setCancelReason('')
    },
    onError: () => toast.error('Error al cancelar la reserva'),
  })

  const handleCancel = () => {
    if (!cancelReason.trim()) {
      toast.error('Ingresá un motivo de cancelación')
      return
    }
    cancelMutation.mutate()
  }

  if (isLoading) return <div className="space-y-4"><Loading.CardSkeleton /><Loading.CardSkeleton /></div>

  if (error) return (
    <div className="space-y-4">
      <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/bookings')}>Volver</Button>
      <Card className="p-6"><p className="text-red-600">Error al cargar la reserva</p></Card>
    </div>
  )

  const booking = data.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/bookings')}>
          Volver a reservas
        </Button>
        {(booking.status === 'pending' || booking.status === 'confirmed') && !showCancelInput && (
          <Button variant="outline" size="sm" icon={<X className="w-4 h-4" />} onClick={() => setShowCancelInput(true)}>
            Cancelar reserva
          </Button>
        )}
      </div>

      {/* Cancel input */}
      {showCancelInput && (
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Motivo de cancelación</p>
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Motivo..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <Button size="sm" onClick={handleCancel} loading={cancelMutation.isLoading}>Confirmar</Button>
            <Button variant="outline" size="sm" onClick={() => { setShowCancelInput(false); setCancelReason('') }}>Descartar</Button>
          </div>
        </Card>
      )}

      {/* Info principal */}
      <Card>
        <Card.Content className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Reserva #{booking._id?.slice(-8)}</h1>
              <div className="flex items-center gap-3 mt-2">
                {getStatusBadge(booking.status)}
                <Badge variant="default">{booking.bookingType === 'seat_reservation' ? 'Reserva de asiento' : 'Tradicional'}</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{formatPrice(booking.totalPrice)}</p>
              {booking.discountApplied > 0 && (
                <p className="text-sm text-green-600">-{booking.discountApplied}% descuento ({formatPrice(booking.discountAmount)})</p>
              )}
              {booking.originalPrice && booking.discountApplied > 0 && (
                <p className="text-xs text-gray-400 line-through">{formatPrice(booking.originalPrice)}</p>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <Field label="Asientos reservados" value={booking.seatsBooked} />
            <Field label="Estado de pago" value={
              booking.paymentStatus === 'paid' ? '✓ Pagado'
              : booking.paymentStatus === 'pending_payment' ? 'Pendiente pago'
              : booking.paymentStatus === 'refunded' ? 'Reembolsado'
              : booking.paymentStatus
            } />
            <Field label="Creada" value={booking.createdAt ? format(new Date(booking.createdAt), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'} />
            <Field label="Actualizada" value={booking.updatedAt ? format(new Date(booking.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'} />
          </div>
          {booking.message && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Mensaje del pasajero</p>
              <p className="text-sm text-gray-800 italic">"{booking.message}"</p>
            </div>
          )}
          {booking.status === 'cancelled' && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <p className="text-xs font-medium text-red-700 mb-1">Cancelación</p>
              <p className="text-sm text-red-800">{booking.cancellationReason || 'Sin motivo indicado'}</p>
              {booking.cancelledAt && (
                <p className="text-xs text-red-500 mt-1">{format(new Date(booking.cancelledAt), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
              )}
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Pasajero + Conductor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header><Card.Title>Pasajero</Card.Title></Card.Header>
          <Card.Content className="p-6">
            <div className="flex items-center gap-4 mb-4">
              {booking.passenger?.avatar ? (
                <img src={booking.passenger.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{booking.passenger?.firstName} {booking.passenger?.lastName}</p>
                <p className="text-sm text-gray-500">{booking.passenger?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Field label="Teléfono" value={booking.passenger?.phone} />
              <Field label="Ciudad" value={booking.passenger?.city} />
              <Field label="Provincia" value={booking.passenger?.province} />
              <Field label="Rating" value={booking.passenger?.rating ? `${booking.passenger.rating.toFixed(1)} ★` : '—'} />
              <Field label="Verificado" value={booking.passenger?.verified ? '✓ Sí' : '✗ No'} />
            </div>
            {booking.passenger?._id && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate(`/users/${booking.passenger._id}`)}>
                Ver perfil completo
              </Button>
            )}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header><Card.Title>Conductor</Card.Title></Card.Header>
          <Card.Content className="p-6">
            {booking.trip?.driver ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  {booking.trip.driver.avatar ? (
                    <img src={booking.trip.driver.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Car className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{booking.trip.driver.firstName} {booking.trip.driver.lastName}</p>
                    <p className="text-sm text-gray-500">{booking.trip.driver.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Field label="Teléfono" value={booking.trip.driver.phone} />
                  <Field label="Rating" value={booking.trip.driver.rating ? `${booking.trip.driver.rating.toFixed(1)} ★` : '—'} />
                  <Field label="Verificado" value={booking.trip.driver.verified ? '✓ Sí' : '✗ No'} />
                </div>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate(`/users/${booking.trip.driver._id}`)}>
                  Ver perfil completo
                </Button>
              </>
            ) : <p className="text-sm text-gray-500">Sin información de conductor</p>}
          </Card.Content>
        </Card>
      </div>

      {/* Viaje */}
      {booking.trip && (
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Viaje asociado</Card.Title>
              <Button variant="outline" size="sm" onClick={() => navigate(`/trips/${booking.trip._id}`)}>
                Ver viaje completo
              </Button>
            </div>
          </Card.Header>
          <Card.Content className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-sm">{booking.trip.origin?.city}</span>
                  <span className="text-gray-400 text-xs">{booking.trip.origin?.province}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span className="font-medium text-sm">{booking.trip.destination?.city}</span>
                  <span className="text-gray-400 text-xs">{booking.trip.destination?.province}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Fecha" value={booking.trip.departureDate ? format(new Date(booking.trip.departureDate), 'dd/MM/yyyy', { locale: es }) : 'N/A'} />
              <Field label="Hora" value={booking.trip.departureTime} />
              <Field label="Precio por asiento" value={formatPrice(booking.trip.pricePerSeat)} />
              <Field label="Estado del viaje" value={
                <Badge variant={booking.trip.status === 'active' ? 'success' : booking.trip.status === 'cancelled' ? 'danger' : 'default'}>
                  {booking.trip.status}
                </Badge>
              } />
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  )
}

export default BookingDetail
