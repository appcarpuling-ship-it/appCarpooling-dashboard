import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Table, Button, Input, Modal, Badge, Loading } from '../components/common'
import { adminService } from '../services'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import {
  Ticket,
  Search,
  Eye,
  X,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Filter,
  Clock,
  User,
  Car
} from 'lucide-react'

const Bookings = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 10
  })
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const queryClient = useQueryClient()

  // Fetch bookings with filters
  const { data: bookingsData, isLoading, error } = useQuery({
    queryKey: ['admin-bookings', filters],
    queryFn: () => adminService.bookings.getAll(filters),
    keepPreviousData: true
  })

  // Mutations
  const cancelBookingMutation = useMutation({
    mutationFn: ({ bookingId, reason }) => adminService.bookings.cancel(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-bookings'])
      toast.success('Reserva cancelada exitosamente')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al cancelar reserva')
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

  const viewBookingDetails = async (booking) => {
    setSelectedBooking(booking)
    setShowBookingModal(true)
  }

  const handleCancelBooking = (bookingId) => {
    const reason = prompt('Motivo de cancelación:')
    if (reason) {
      cancelBookingMutation.mutate({ bookingId, reason })
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', label: 'Pendiente' },
      confirmed: { variant: 'success', label: 'Confirmada' },
      cancelled: { variant: 'danger', label: 'Cancelada' },
      completed: { variant: 'info', label: 'Completada' },
      rejected: { variant: 'secondary', label: 'Rechazada' }
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

  const bookings = bookingsData?.data?.bookings || []
  const pagination = bookingsData?.data?.pagination || {}

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Reservas</h1>
        <Card className="p-6">
          <p className="text-red-600">Error al cargar reservas: {error.message}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Reservas</h1>
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
              placeholder="Buscar por pasajero, conductor o viaje..."
              value={filters.search}
              onChange={handleSearch}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
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
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="cancelled">Cancelada</option>
                <option value="completed">Completada</option>
                <option value="rejected">Rechazada</option>
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
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Bookings Table */}
      <Card>
        <Card.Header>
          <Card.Title>
            Reservas ({pagination.total || 0})
          </Card.Title>
        </Card.Header>
        <Card.Content className="p-0">
          {isLoading ? (
            <div className="p-8">
              <Loading.TableSkeleton rows={5} />
            </div>
          ) : bookings.length > 0 ? (
            <>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Pasajero</Table.Head>
                    <Table.Head>Viaje</Table.Head>
                    <Table.Head>Conductor</Table.Head>
                    <Table.Head>Asientos</Table.Head>
                    <Table.Head>Precio Total</Table.Head>
                    <Table.Head>Estado</Table.Head>
                    <Table.Head>Fecha Reserva</Table.Head>
                    <Table.Head>Acciones</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {bookings.map((booking) => (
                    <Table.Row key={booking._id}>
                      <Table.Cell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {booking.passenger?.avatar ? (
                              <img
                                src={booking.passenger.avatar}
                                alt={booking.passenger.firstName}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {booking.passenger?.firstName} {booking.passenger?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{booking.passenger?.email}</p>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-gray-900">{booking.trip?.origin?.city}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 text-red-500 mr-1" />
                            <span className="text-gray-900">{booking.trip?.destination?.city}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                            <span className="text-gray-500">
                              {format(new Date(booking.trip?.departureDate), 'dd/MM/yyyy', { locale: es })}
                            </span>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center space-x-2">
                          {booking.trip?.driver?.avatar ? (
                            <img
                              src={booking.trip.driver.avatar}
                              alt={booking.trip.driver.firstName}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                              <Car className="w-3 h-3 text-gray-600" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-900">
                              {booking.trip?.driver?.firstName} {booking.trip?.driver?.lastName}
                            </p>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-500 mr-1" />
                          <span className="text-sm text-gray-900">
                            {booking.seatsBooked}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(booking.totalPrice)}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {getStatusBadge(booking.status)}
                      </Table.Cell>
                      <Table.Cell>
                        <p className="text-sm text-gray-900">
                          {format(new Date(booking.createdAt), 'dd/MM/yyyy', { locale: es })}
                        </p>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={() => viewBookingDetails(booking)}
                          />
                          {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<X className="w-4 h-4" />}
                              onClick={() => handleCancelBooking(booking._id)}
                              loading={cancelBookingMutation.isLoading}
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
                      {pagination.total} reservas
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
            <Table.Empty message="No se encontraron reservas" />
          )}
        </Card.Content>
      </Card>

      {/* Booking Details Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false)
          setSelectedBooking(null)
        }}
        size="xl"
      >
        <Modal.Content>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detalles de la Reserva
            </h3>
            {selectedBooking && (
              <div className="space-y-6">
                {/* Booking Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Información de la Reserva</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ID de Reserva</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedBooking._id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Asientos Reservados</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedBooking.seatsBooked}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Precio Total</label>
                      <p className="mt-1 text-sm text-gray-900">{formatPrice(selectedBooking.totalPrice)}</p>
                    </div>
                  </div>
                </div>

                {/* Passenger Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Pasajero</h4>
                  <div className="flex items-center space-x-4">
                    {selectedBooking.passenger?.avatar ? (
                      <img
                        src={selectedBooking.passenger.avatar}
                        alt={selectedBooking.passenger.firstName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {selectedBooking.passenger?.firstName} {selectedBooking.passenger?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{selectedBooking.passenger?.email}</p>
                      <p className="text-sm text-gray-600">{selectedBooking.passenger?.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Trip Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Información del Viaje</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Origen</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedBooking.trip?.origin?.address}, {selectedBooking.trip?.origin?.city}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Destino</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedBooking.trip?.destination?.address}, {selectedBooking.trip?.destination?.city}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {format(new Date(selectedBooking.trip?.departureDate), 'dd/MM/yyyy', { locale: es })} - {selectedBooking.trip?.departureTime}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Precio por Asiento</label>
                      <p className="mt-1 text-sm text-gray-900">{formatPrice(selectedBooking.trip?.pricePerSeat)}</p>
                    </div>
                  </div>
                </div>

                {/* Driver Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Conductor</h4>
                  <div className="flex items-center space-x-4">
                    {selectedBooking.trip?.driver?.avatar ? (
                      <img
                        src={selectedBooking.trip.driver.avatar}
                        alt={selectedBooking.trip.driver.firstName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <Car className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {selectedBooking.trip?.driver?.firstName} {selectedBooking.trip?.driver?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{selectedBooking.trip?.driver?.email}</p>
                      <p className="text-sm text-gray-600">
                        Rating: {selectedBooking.trip?.driver?.rating?.toFixed(1)} ★
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Reserva</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {format(new Date(selectedBooking.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Última Actualización</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {format(new Date(selectedBooking.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
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
              setShowBookingModal(false)
              setSelectedBooking(null)
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Bookings