import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Badge, Button, Loading } from '../components/common'
import { tripService, adminService } from '../services'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Car, MapPin, Calendar, Clock, Users,
  DollarSign, X, User, Check, AlertTriangle
} from 'lucide-react'

const Field = ({ label, value }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500">{label}</label>
    <p className="mt-0.5 text-sm text-gray-900">{value ?? 'N/A'}</p>
  </div>
)

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
    {Icon && <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />}
    <div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
)

const RuleTag = ({ label, allowed }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
    allowed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
  }`}>
    {allowed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
    {label}
  </span>
)

const formatPrice = (price, currency = 'ARS') =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(price ?? 0)

const getStatusBadge = (status) => {
  const map = {
    active: { variant: 'success', label: 'Activo' },
    completed: { variant: 'info', label: 'Completado' },
    cancelled: { variant: 'danger', label: 'Cancelado' },
    expired: { variant: 'warning', label: 'Expirado' },
  }
  const c = map[status] || { variant: 'default', label: status }
  return <Badge variant={c.variant}>{c.label}</Badge>
}

const TripDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelInput, setShowCancelInput] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => tripService.getById(id),
  })

  const cancelMutation = useMutation({
    mutationFn: () => adminService.trips.cancel(id, cancelReason),
    onSuccess: () => {
      queryClient.invalidateQueries(['trip', id])
      toast.success('Viaje cancelado')
      setShowCancelInput(false)
      setCancelReason('')
    },
    onError: () => toast.error('Error al cancelar el viaje'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => adminService.trips.delete(id),
    onSuccess: () => {
      toast.success('Viaje eliminado')
      navigate('/trips')
    },
    onError: () => toast.error('Error al eliminar el viaje'),
  })

  const handleCancel = () => {
    if (!cancelReason.trim()) {
      toast.error('Ingresá un motivo de cancelación')
      return
    }
    cancelMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Loading.CardSkeleton />
        <Loading.CardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/trips')}>
          Volver
        </Button>
        <Card className="p-6">
          <p className="text-red-600">Error al cargar el viaje</p>
        </Card>
      </div>
    )
  }

  const trip = data.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/trips')}>
          Volver a viajes
        </Button>
        <div className="flex gap-2">
          {trip.status === 'active' && !showCancelInput && (
            <Button
              variant="outline"
              size="sm"
              icon={<X className="w-4 h-4" />}
              onClick={() => setShowCancelInput(true)}
            >
              Cancelar viaje
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
            onClick={() => {
              if (window.confirm('¿Eliminar este viaje permanentemente?')) deleteMutation.mutate()
            }}
            loading={deleteMutation.isLoading}
          >
            Eliminar
          </Button>
        </div>
      </div>

      {/* Cancel reason input */}
      {showCancelInput && (
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Motivo de cancelación</p>
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Conductor no disponible..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <Button size="sm" onClick={handleCancel} loading={cancelMutation.isLoading}>
              Confirmar
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setShowCancelInput(false); setCancelReason('') }}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* Ruta + estado */}
      <Card>
        <Card.Content className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-gray-900">{trip.origin?.city}</span>
                <span className="text-gray-400 text-sm">{trip.origin?.province}</span>
              </div>
              <div className="ml-4 border-l-2 border-dashed border-gray-200 pl-4 py-1 my-1">
                <span className="text-xs text-gray-400">{trip.distanceInfo?.distance ? `${trip.distanceInfo.distance} km` : '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="font-semibold text-gray-900">{trip.destination?.city}</span>
                <span className="text-gray-400 text-sm">{trip.destination?.province}</span>
              </div>
            </div>
            <div className="text-right space-y-2">
              {getStatusBadge(trip.status)}
              <p className="text-xs text-gray-400">
                {trip.serviceType === 'carpooling' ? 'Carpooling' : trip.serviceType}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {trip.departureDate ? format(new Date(trip.departureDate), 'dd/MM/yyyy', { locale: es }) : '—'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {trip.departureTime}
            </span>
          </div>
          {trip.description && (
            <p className="mt-3 text-sm text-gray-600 italic">"{trip.description}"</p>
          )}
        </Card.Content>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Asientos disponibles" value={trip.availableSeats} icon={Users} />
        <StatCard label="Asientos ocupados" value={trip.occupiedSeats ?? 0} icon={Users} />
        <StatCard label="Precio por asiento" value={formatPrice(trip.pricePerSeat, trip.currency)} icon={DollarSign} />
        <StatCard label="Distancia" value={trip.distanceKm ? `${trip.distanceKm} km` : '—'} icon={MapPin} />
      </div>

      {/* Conductor + Vehículo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conductor */}
        <Card>
          <Card.Header>
            <Card.Title>Conductor</Card.Title>
          </Card.Header>
          <Card.Content className="p-6">
            <div className="flex items-center gap-4 mb-4">
              {trip.driver?.avatar ? (
                <img src={trip.driver.avatar} alt={trip.driver.firstName} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{trip.driver?.firstName} {trip.driver?.lastName}</p>
                <p className="text-sm text-gray-500">{trip.driver?.email}</p>
                <p className="text-sm text-gray-500">{trip.driver?.phone}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Field label="Rating" value={trip.driver?.rating ? `${trip.driver.rating.toFixed(1)} ★` : '—'} />
              <Field label="Verificado" value={trip.driver?.verified ? '✓ Sí' : '✗ No'} />
              {trip.driver?.bio && <Field label="Bio" value={trip.driver.bio} />}
            </div>
            {trip.driver?._id && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => navigate(`/users/${trip.driver._id}`)}
              >
                Ver perfil completo
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Vehículo */}
        {trip.vehicle && (
          <Card>
            <Card.Header>
              <Card.Title>Vehículo</Card.Title>
            </Card.Header>
            <Card.Content className="p-6">
              {trip.vehicle.photo && (
                <img
                  src={trip.vehicle.photo}
                  alt="Vehículo"
                  className="w-full h-36 object-cover rounded-lg mb-4 border border-gray-100"
                />
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Marca" value={trip.vehicle.brand} />
                <Field label="Modelo" value={trip.vehicle.model} />
                <Field label="Año" value={trip.vehicle.year} />
                <Field label="Color" value={trip.vehicle.color} />
                <Field label="Patente" value={<span className="font-mono">{trip.vehicle.licensePlate}</span>} />
                <Field label="Capacidad" value={`${trip.vehicle.capacity} pasajeros`} />
                <Field label="Tipo" value={trip.vehicle.type} />
                <Field label="Verificado" value={trip.vehicle.verified ? '✓ Sí' : '✗ No'} />
              </div>
            </Card.Content>
          </Card>
        )}
      </div>

      {/* Reglas + Ruta detallada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reglas */}
        <Card>
          <Card.Header>
            <Card.Title>Reglas del viaje</Card.Title>
          </Card.Header>
          <Card.Content className="p-6">
            <div className="flex flex-wrap gap-2">
              <RuleTag label="Fumar" allowed={trip.rules?.smokingAllowed} />
              <RuleTag label="Mascotas" allowed={trip.rules?.petsAllowed} />
              <RuleTag label="Música" allowed={trip.rules?.musicAllowed} />
              <RuleTag label="Solo mujeres" allowed={trip.rules?.womenOnly} />
              <RuleTag label="Equipaje grande" allowed={trip.rules?.largeLuggageAllowed} />
            </div>
          </Card.Content>
        </Card>

        {/* Ruta detallada */}
        <Card>
          <Card.Header>
            <Card.Title>Ruta</Card.Title>
          </Card.Header>
          <Card.Content className="p-6 space-y-3">
            <Field label="Origen" value={trip.origin?.address} />
            <Field label="Destino" value={trip.destination?.address} />
            {trip.distanceInfo?.warning && (
              <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">{trip.distanceInfo.warning}</p>
            )}
            {trip.intermediateStops?.length > 0 && (
              <Field label="Paradas intermedias" value={trip.intermediateStops.map(s => s.city).join(', ')} />
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Pasajeros */}
      <Card>
        <Card.Header>
          <Card.Title>Pasajeros ({trip.passengers?.length ?? 0})</Card.Title>
        </Card.Header>
        <Card.Content className="p-6">
          {trip.passengers?.length > 0 ? (
            <div className="space-y-3">
              {trip.passengers.map((p) => (
                <div key={p._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.firstName} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-gray-500">{p.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Sin pasajeros aún</p>
          )}
        </Card.Content>
      </Card>

      {/* Timestamps */}
      <Card>
        <Card.Header>
          <Card.Title>Fechas</Card.Title>
        </Card.Header>
        <Card.Content className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Creado" value={trip.createdAt ? format(new Date(trip.createdAt), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'} />
            <Field label="Actualizado" value={trip.updatedAt ? format(new Date(trip.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'} />
            <Field label="Iniciado" value={trip.startedAt ? format(new Date(trip.startedAt), 'dd/MM/yyyy HH:mm', { locale: es }) : '—'} />
            <Field label="Completado" value={trip.completedAt ? format(new Date(trip.completedAt), 'dd/MM/yyyy HH:mm', { locale: es }) : '—'} />
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}

export default TripDetail
