import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Table, Button, Input, Modal, Badge, Loading } from '../components/common'
import { commissionService } from '../services'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import {
  Receipt,
  Search,
  Eye,
  Check,
  X,
  Calculator,
  Bell,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  User,
  Car
} from 'lucide-react'

const Commissions = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    month: '',
    year: '',
    page: 1,
    limit: 10
  })
  const [selectedCommission, setSelectedCommission] = useState(null)
  const [showCommissionModal, setShowCommissionModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const queryClient = useQueryClient()

  // Fetch commissions summary
  const { data: summaryData } = useQuery({
    queryKey: ['admin-commissions-summary'],
    queryFn: () => commissionService.admin.getSummary()
  })

  // Fetch all commissions
  const { data: commissionsData, isLoading, error } = useQuery({
    queryKey: ['admin-commissions', filters],
    queryFn: () => commissionService.admin.getAll(filters),
    keepPreviousData: true
  })

  // Mutations
  const waiveCommissionMutation = useMutation({
    mutationFn: ({ commissionId, reason }) => commissionService.admin.waive(commissionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-commissions'])
      queryClient.invalidateQueries(['admin-commissions-summary'])
      toast.success('Comisión eximida exitosamente')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eximir comisión')
    }
  })

  const calculateCommissionsMutation = useMutation({
    mutationFn: ({ month, year }) => commissionService.admin.calculate(month, year),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-commissions'])
      queryClient.invalidateQueries(['admin-commissions-summary'])
      toast.success('Comisiones calculadas exitosamente')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al calcular comisiones')
    }
  })

  const sendNotificationsMutation = useMutation({
    mutationFn: () => commissionService.admin.sendNotifications(),
    onSuccess: () => {
      toast.success('Notificaciones enviadas exitosamente')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al enviar notificaciones')
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

  const viewCommissionDetails = async (commissionId) => {
    try {
      const commission = await commissionService.getById(commissionId)
      setSelectedCommission(commission.data)
      setShowCommissionModal(true)
    } catch (error) {
      toast.error('Error al cargar detalles de la comisión')
    }
  }

  const handleWaiveCommission = (commissionId) => {
    const reason = prompt('Motivo para eximir la comisión:')
    if (reason) {
      waiveCommissionMutation.mutate({ commissionId, reason })
    }
  }

  const handleCalculateCommissions = () => {
    const currentDate = new Date()
    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear()

    const confirmed = confirm(`¿Calcular comisiones para ${month}/${year}?`)
    if (confirmed) {
      calculateCommissionsMutation.mutate({ month, year })
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', label: 'Pendiente' },
      paid: { variant: 'success', label: 'Pagada' },
      waived: { variant: 'info', label: 'Eximida' },
      overdue: { variant: 'danger', label: 'Vencida' }
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

  const commissions = commissionsData?.data || []
  const pagination = commissionsData?.pagination || {}
  const summary = summaryData || {}

  // Generate month/year options
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ]

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Comisiones</h1>
        <Card className="p-6">
          <p className="text-red-600">Error al cargar comisiones: {error.message}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Comisiones</h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            icon={<Bell className="w-4 h-4" />}
            onClick={() => sendNotificationsMutation.mutate()}
            loading={sendNotificationsMutation.isLoading}
          >
            Enviar Notificaciones
          </Button>
          <Button
            variant="primary"
            icon={<Calculator className="w-4 h-4" />}
            onClick={handleCalculateCommissions}
            loading={calculateCommissionsMutation.isLoading}
          >
            Calcular Comisiones
          </Button>
        </div>
      </div>

      {/* Commission Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pendiente</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatPrice(summary.totalPending || 0)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pagado</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(summary.totalPaid || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Eximido</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatPrice(summary.totalWaived || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <X className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conductores con Comisiones</p>
              <p className="text-2xl font-bold text-purple-600">
                {summary.totalDrivers || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por conductor o descripción..."
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
                <option value="paid">Pagada</option>
                <option value="waived">Eximida</option>
                <option value="overdue">Vencida</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mes
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
              >
                <option value="">Todos</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
              >
                <option value="">Todos</option>
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
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

      {/* Commissions Table */}
      <Card>
        <Card.Header>
          <Card.Title>
            Comisiones ({pagination.total || 0})
          </Card.Title>
        </Card.Header>
        <Card.Content className="p-0">
          {isLoading ? (
            <div className="p-8">
              <Loading.TableSkeleton rows={5} />
            </div>
          ) : commissions.length > 0 ? (
            <>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Conductor</Table.Head>
                    <Table.Head>Período</Table.Head>
                    <Table.Head>Viajes</Table.Head>
                    <Table.Head>Monto</Table.Head>
                    <Table.Head>Estado</Table.Head>
                    <Table.Head>Fecha Vencimiento</Table.Head>
                    <Table.Head>Acciones</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {commissions.map((commission) => (
                    <Table.Row key={commission._id}>
                      <Table.Cell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {commission.driver?.avatar ? (
                              <img
                                src={commission.driver.avatar}
                                alt={commission.driver.firstName}
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
                              {commission.driver?.firstName} {commission.driver?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{commission.driver?.email}</p>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                            <span className="text-gray-900">
                              {commission.month}/{commission.year}
                            </span>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <p className="text-sm text-gray-900">{commission.totalTrips || 0}</p>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(commission.amount)}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {getStatusBadge(commission.status)}
                      </Table.Cell>
                      <Table.Cell>
                        <p className="text-sm text-gray-900">
                          {commission.dueDate ?
                            format(new Date(commission.dueDate), 'dd/MM/yyyy', { locale: es })
                            : 'N/A'
                          }
                        </p>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={() => viewCommissionDetails(commission._id)}
                          />
                          {commission.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<X className="w-4 h-4" />}
                              onClick={() => handleWaiveCommission(commission._id)}
                              loading={waiveCommissionMutation.isLoading}
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
                      {pagination.total} comisiones
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
            <Table.Empty message="No se encontraron comisiones" />
          )}
        </Card.Content>
      </Card>

      {/* Commission Details Modal */}
      <Modal
        isOpen={showCommissionModal}
        onClose={() => {
          setShowCommissionModal(false)
          setSelectedCommission(null)
        }}
        size="xl"
      >
        <Modal.Content>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detalles de la Comisión
            </h3>
            {selectedCommission && (
              <div className="space-y-6">
                {/* Commission Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Información de la Comisión</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ID de Comisión</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedCommission._id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <div className="mt-1">{getStatusBadge(selectedCommission.status)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Período</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedCommission.month}/{selectedCommission.year}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Monto</label>
                      <p className="mt-1 text-sm text-gray-900 font-bold">
                        {formatPrice(selectedCommission.amount)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total de Viajes</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedCommission.totalTrips || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedCommission.dueDate ?
                          format(new Date(selectedCommission.dueDate), 'dd/MM/yyyy', { locale: es })
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Driver Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Conductor</h4>
                  <div className="flex items-center space-x-4">
                    {selectedCommission.driver?.avatar ? (
                      <img
                        src={selectedCommission.driver.avatar}
                        alt={selectedCommission.driver.firstName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <Car className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {selectedCommission.driver?.firstName} {selectedCommission.driver?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{selectedCommission.driver?.email}</p>
                      <p className="text-sm text-gray-600">{selectedCommission.driver?.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                {selectedCommission.paymentMethod && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Información de Pago</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedCommission.paymentMethod}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de Pago</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedCommission.paidAt ?
                            format(new Date(selectedCommission.paidAt), 'dd/MM/yyyy HH:mm', { locale: es })
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description/Reason */}
                {selectedCommission.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCommission.description}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {format(new Date(selectedCommission.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Última Actualización</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {format(new Date(selectedCommission.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
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
              setShowCommissionModal(false)
              setSelectedCommission(null)
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Commissions