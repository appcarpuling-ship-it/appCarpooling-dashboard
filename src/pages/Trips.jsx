import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Table, Button, Input, Modal, Badge, Loading } from '../components/common'
import { adminService } from '../services'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import {
  Car,
  Search,
  Eye,
  X,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Filter,
  Clock
} from 'lucide-react'

const Trips = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    origin: '',
    destination: '',
    page: 1,
    limit: 10
  })
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [showTripModal, setShowTripModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const queryClient = useQueryClient()

  // Fetch trips with filters
  const { data: tripsData, isLoading, error } = useQuery({
    queryKey: ['admin-trips', filters],
    queryFn: () => adminService.trips.getAll(filters),
    keepPreviousData: true
  })

  // Mutations
  const cancelTripMutation = useMutation({
    mutationFn: ({ tripId, reason }) => adminService.trips.cancel(tripId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-trips'])
      toast.success('Viaje cancelado exitosamente')
      setCancelReason('')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al cancelar viaje')
    }
  })

  const deleteTripMutation = useMutation({
    mutationFn: adminService.trips.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-trips'])
      toast.success('Viaje eliminado exitosamente')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar viaje')
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

  const viewTripDetails = async (tripId) => {
    try {
      const tripResponse = await fetch(`/api/trips/${tripId}`)
      if (tripResponse.ok) {
        const trip = await tripResponse.json()
        setSelectedTrip(trip.data)
        setShowTripModal(true)
      }
    } catch (error) {
      toast.error('Error al cargar detalles del viaje')
    }
  }

  const handleCancelTrip = (tripId) => {
    if (!cancelReason.trim()) {
      toast.error('Debe proporcionar un motivo para cancelar el viaje')
      return
    }
    cancelTripMutation.mutate({ tripId, reason: cancelReason })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', label: 'Activo' },
      completed: { variant: 'info', label: 'Completado' },
      cancelled: { variant: 'danger', label: 'Cancelado' },
      expired: { variant: 'warning', label: 'Expirado' }
    }

    const config = statusConfig[status] || { variant: 'default', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  const trips = tripsData?.data?.trips || []
  const pagination = tripsData?.data?.pagination || {}

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Viajes</h1>
        <Card className="p-6">
          <p className="text-red-600">Error al cargar viajes: {error.message}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Viajes</h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por origen, destino o conductor..."
              value={filters.search}
              onChange={handleSearch}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="active">Activos</option>
                <option value="completed">Completados</option>
                <option value="cancelled">Cancelados</option>
                <option value="expired">Expirados</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad Origen
              </label>
              <Input
                placeholder="Ej: Buenos Aires"
                value={filters.origin}
                onChange={(e) => handleFilterChange('origin', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad Destino
              </label>
              <Input
                placeholder="Ej: Rosario"
                value={filters.destination}
                onChange={(e) => handleFilterChange('destination', e.target.value)}
              />
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
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Trips Table */}
      <Card>
        <Card.Header>
          <Card.Title>
            Viajes ({pagination.total || 0})
          </Card.Title>
        </Card.Header>
        <Card.Content className="p-0">
          {isLoading ? (
            <div className="p-8">
              <Loading.TableSkeleton rows={5} />
            </div>
          ) : trips.length > 0 ? (
            <>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Conductor</Table.Head>
                    <Table.Head>Ruta</Table.Head>
                    <Table.Head>Fecha y Hora</Table.Head>
                    <Table.Head>Asientos</Table.Head>
                    <Table.Head>Precio</Table.Head>
                    <Table.Head>Estado</Table.Head>
                    <Table.Head>Creado</Table.Head>
                    <Table.Head>Acciones</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {trips.map((trip) => (
                    <Table.Row key={trip._id}>
                      <Table.Cell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {trip.driver?.avatar ? (
                              <img
                                src={trip.driver.avatar}
                                alt={trip.driver.firstName}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <Car className="w-4 h-4 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {trip.driver?.firstName} {trip.driver?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              Rating: {trip.driver?.rating ? trip.driver.rating.toFixed(1) : 'N/A'} ★
                            </p>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-gray-900">{trip.origin?.city}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 text-red-500 mr-1" />
                            <span className="text-gray-900">{trip.destination?.city}</span>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                            <span className="text-gray-900">
                              {format(new Date(trip.departureDate), 'dd/MM/yyyy', { locale: es })}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="w-4 h-4 text-gray-500 mr-1" />
                            <span className="text-gray-500">{trip.departureTime}</span>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-500 mr-1" />
                          <span className="text-sm text-gray-900">
                            {trip.availableSeats} disponibles
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(trip.pricePerSeat)}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {getStatusBadge(trip.status)}
                      </Table.Cell>
                      <Table.Cell>
                        <p className="text-sm text-gray-900">
                          {format(new Date(trip.createdAt), 'dd/MM/yyyy', { locale: es })}
                        </p>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={() => viewTripDetails(trip._id)}
                          />
                          {trip.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<X className="w-4 h-4" />}
                              onClick={() => {
                                const reason = prompt('Motivo de cancelación:')
                                if (reason) {
                                  setCancelReason(reason)
                                  handleCancelTrip(trip._id)
                                }
                              }}
                              loading={cancelTripMutation.isLoading}
                            />
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                      Mostrando {((pagination.currentPage - 1) * pagination.limit) + 1} a{' '}
                      {Math.min(pagination.currentPage * pagination.limit, pagination.total)} de{' '}
                      {pagination.total} viajes
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
            <Table.Empty message="No se encontraron viajes" />
          )}
        </Card.Content>
      </Card>

      {/* Trip Details Modal */}
      <Modal
        isOpen={showTripModal}
        onClose={() => {
          setShowTripModal(false)
          setSelectedTrip(null)
        }}
        size="xl"
      >
        <Modal.Content>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detalles del Viaje
            </h3>
            {selectedTrip && (
              <div className="space-y-6">
                {/* Driver Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Conductor</h4>
                  <div className="flex items-center space-x-4">
                    {selectedTrip.driver?.avatar ? (
                      <img
                        src={selectedTrip.driver.avatar}
                        alt={selectedTrip.driver.firstName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <Car className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {selectedTrip.driver?.firstName} {selectedTrip.driver?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{selectedTrip.driver?.email}</p>
                      <p className="text-sm text-gray-600">
                        Rating: {selectedTrip.driver?.rating?.toFixed(1)} ★
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Información del Viaje</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Estado</label>
                        <div className="mt-1">{getStatusBadge(selectedTrip.status)}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {format(new Date(selectedTrip.departureDate), 'dd/MM/yyyy', { locale: es })} - {selectedTrip.departureTime}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Asientos Disponibles</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedTrip.availableSeats}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Precio por Asiento</label>
                        <p className="mt-1 text-sm text-gray-900">{formatPrice(selectedTrip.pricePerSeat)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Ruta</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Origen</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedTrip.origin?.address}, {selectedTrip.origin?.city}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Destino</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedTrip.destination?.address}, {selectedTrip.destination?.city}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Info */}
                {selectedTrip.vehicle && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Vehículo</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Marca y Modelo</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedTrip.vehicle.make} {selectedTrip.vehicle.model}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Color</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedTrip.vehicle.color}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Patente</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedTrip.vehicle.licensePlate}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedTrip.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTrip.description}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {format(new Date(selectedTrip.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Última Actualización</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {format(new Date(selectedTrip.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
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
              setShowTripModal(false)
              setSelectedTrip(null)
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Trips