import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Table, Button, Input, Modal, Badge, Loading } from '../components/common'
import { paymentService } from '../services'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import {
  CreditCard,
  Search,
  Eye,
  Check,
  X,
  RefreshCw,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  User,
  Car,
  AlertCircle
} from 'lucide-react'

const Payments = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paymentMethod: '',
    type: '', // 'sent', 'received'
    page: 1,
    limit: 10
  })
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const queryClient = useQueryClient()

  // Fetch payment summary
  const { data: summaryData } = useQuery({
    queryKey: ['payment-summary'],
    queryFn: () => paymentService.getSummary()
  })

  // Fetch payments (we'll combine sent and received)
  const { data: sentPayments, isLoading: loadingSent } = useQuery({
    queryKey: ['payments-sent', filters],
    queryFn: () => paymentService.getSent(filters),
    enabled: filters.type === '' || filters.type === 'sent'
  })

  const { data: receivedPayments, isLoading: loadingReceived } = useQuery({
    queryKey: ['payments-received', filters],
    queryFn: () => paymentService.getReceived(filters),
    enabled: filters.type === '' || filters.type === 'received'
  })

  // Mutations
  const confirmPaymentMutation = useMutation({
    mutationFn: paymentService.confirm,
    onSuccess: () => {
      queryClient.invalidateQueries(['payments-sent'])
      queryClient.invalidateQueries(['payments-received'])
      queryClient.invalidateQueries(['payment-summary'])
      toast.success('Pago confirmado exitosamente')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al confirmar pago')
    }
  })

  const requestRefundMutation = useMutation({
    mutationFn: ({ paymentId, reason }) => paymentService.requestRefund(paymentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['payments-sent'])
      queryClient.invalidateQueries(['payments-received'])
      toast.success('Solicitud de reembolso enviada')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al solicitar reembolso')
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

  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment)
    setShowPaymentModal(true)
  }

  const handleConfirmPayment = (paymentId) => {
    confirmPaymentMutation.mutate(paymentId)
  }

  const handleRequestRefund = (paymentId) => {
    const reason = prompt('Motivo del reembolso:')
    if (reason) {
      requestRefundMutation.mutate({ paymentId, reason })
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', label: 'Pendiente' },
      completed: { variant: 'success', label: 'Completado' },
      failed: { variant: 'danger', label: 'Fallido' },
      refunded: { variant: 'info', label: 'Reembolsado' },
      cancelled: { variant: 'secondary', label: 'Cancelado' }
    }

    const config = statusConfig[status] || { variant: 'default', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getMethodBadge = (method) => {
    const methodConfig = {
      mercadopago: { variant: 'primary', label: 'MercadoPago' },
      transfer: { variant: 'info', label: 'Transferencia' },
      cash: { variant: 'success', label: 'Efectivo' }
    }

    const config = methodConfig[method] || { variant: 'default', label: method }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  // Combine sent and received payments
  const allPayments = [
    ...(sentPayments?.data?.payments || []).map(p => ({ ...p, type: 'sent' })),
    ...(receivedPayments?.data?.payments || []).map(p => ({ ...p, type: 'received' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const isLoading = loadingSent || loadingReceived
  const summary = summaryData?.data || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h1>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Recibido</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(summary.totalReceived || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Enviado</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatPrice(summary.totalSent || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingDown className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pagos Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {summary.pendingPayments || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pagos Completados</p>
              <p className="text-2xl font-bold text-green-600">
                {summary.completedPayments || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por usuario, reserva o método de pago..."
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
                <option value="pending">Pendiente</option>
                <option value="completed">Completado</option>
                <option value="failed">Fallido</option>
                <option value="refunded">Reembolsado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="mercadopago">MercadoPago</option>
                <option value="transfer">Transferencia</option>
                <option value="cash">Efectivo</option>
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
                <option value="received">Recibidos</option>
                <option value="sent">Enviados</option>
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

      {/* Payments Table */}
      <Card>
        <Card.Header>
          <Card.Title>
            Transacciones ({allPayments.length})
          </Card.Title>
        </Card.Header>
        <Card.Content className="p-0">
          {isLoading ? (
            <div className="p-8">
              <Loading.TableSkeleton rows={5} />
            </div>
          ) : allPayments.length > 0 ? (
            <>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Usuario</Table.Head>
                    <Table.Head>Reserva</Table.Head>
                    <Table.Head>Tipo</Table.Head>
                    <Table.Head>Método</Table.Head>
                    <Table.Head>Monto</Table.Head>
                    <Table.Head>Estado</Table.Head>
                    <Table.Head>Fecha</Table.Head>
                    <Table.Head>Acciones</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {allPayments.map((payment) => (
                    <Table.Row key={`${payment._id}-${payment.type}`}>
                      <Table.Cell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {payment.user?.avatar ? (
                              <img
                                src={payment.user.avatar}
                                alt={payment.user.firstName}
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
                              {payment.user?.firstName} {payment.user?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{payment.user?.email}</p>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900">
                            ID: {payment.booking?._id?.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {payment.booking?.seatsBooked} asiento(s)
                          </p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={payment.type === 'received' ? 'success' : 'info'}>
                          {payment.type === 'received' ? 'Recibido' : 'Enviado'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {getMethodBadge(payment.paymentMethod)}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
                          <span className={`text-sm font-medium ${
                            payment.type === 'received' ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {formatPrice(payment.amount)}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {getStatusBadge(payment.status)}
                      </Table.Cell>
                      <Table.Cell>
                        <p className="text-sm text-gray-900">
                          {format(new Date(payment.createdAt), 'dd/MM/yyyy', { locale: es })}
                        </p>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={() => viewPaymentDetails(payment)}
                          />
                          {payment.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Check className="w-4 h-4" />}
                              onClick={() => handleConfirmPayment(payment._id)}
                              loading={confirmPaymentMutation.isLoading}
                            />
                          )}
                          {payment.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<RefreshCw className="w-4 h-4" />}
                              onClick={() => handleRequestRefund(payment._id)}
                              loading={requestRefundMutation.isLoading}
                            />
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </>
          ) : (
            <Table.Empty message="No se encontraron pagos" />
          )}
        </Card.Content>
      </Card>

      {/* Payment Details Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false)
          setSelectedPayment(null)
        }}
        size="xl"
      >
        <Modal.Content>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detalles del Pago
            </h3>
            {selectedPayment && (
              <div className="space-y-6">
                {/* Payment Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Información del Pago</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ID de Pago</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPayment._id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Método</label>
                      <div className="mt-1">{getMethodBadge(selectedPayment.paymentMethod)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Monto</label>
                      <p className="mt-1 text-sm text-gray-900 font-bold">
                        {formatPrice(selectedPayment.amount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Usuario</h4>
                  <div className="flex items-center space-x-4">
                    {selectedPayment.user?.avatar ? (
                      <img
                        src={selectedPayment.user.avatar}
                        alt={selectedPayment.user.firstName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {selectedPayment.user?.firstName} {selectedPayment.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{selectedPayment.user?.email}</p>
                      <p className="text-sm text-gray-600">{selectedPayment.user?.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Info */}
                {selectedPayment.booking && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Información de la Reserva</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">ID de Reserva</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedPayment.booking._id}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Asientos</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedPayment.booking.seatsBooked}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {format(new Date(selectedPayment.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Última Actualización</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {format(new Date(selectedPayment.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
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
              setShowPaymentModal(false)
              setSelectedPayment(null)
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Payments