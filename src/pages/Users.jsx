import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Table, Button, Input, Modal, Badge, Loading } from '../components/common'
import { adminService } from '../services'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import {
  User,
  Search,
  Eye,
  Check,
  X,
  UserPlus,
  Filter
} from 'lucide-react'

const Users = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    verified: '',
    page: 1,
    limit: 10
  })
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const queryClient = useQueryClient()

  // Fetch users with filters
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => adminService.users.getAll(filters),
    keepPreviousData: true
  })

  // Mutations
  const activateUserMutation = useMutation({
    mutationFn: adminService.users.activate,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users'])
      toast.success('Usuario activado exitosamente')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al activar usuario')
    }
  })

  const deactivateUserMutation = useMutation({
    mutationFn: adminService.users.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users'])
      toast.success('Usuario desactivado exitosamente')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al desactivar usuario')
    }
  })

  const verifyUserMutation = useMutation({
    mutationFn: adminService.users.verify,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users'])
      toast.success('Usuario verificado exitosamente')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al verificar usuario')
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

  const viewUserDetails = async (userId) => {
    try {
      const user = await adminService.users.getById(userId)
      setSelectedUser(user.data)
      setShowUserModal(true)
    } catch (error) {
      toast.error('Error al cargar detalles del usuario')
    }
  }

  const handleUserAction = (action, userId, reason = '') => {
    switch (action) {
      case 'activate':
        activateUserMutation.mutate(userId)
        break
      case 'deactivate':
        deactivateUserMutation.mutate({ userId, reason })
        break
      case 'verify':
        verifyUserMutation.mutate(userId)
        break
    }
  }

  const getStatusBadge = (user) => {
    if (!user.isActive) return <Badge variant="danger">Inactivo</Badge>
    if (!user.isVerified) return <Badge variant="warning">No verificado</Badge>
    return <Badge variant="success">Activo</Badge>
  }

  const users = usersData?.data?.users || []
  const pagination = usersData?.data?.pagination || {}

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <Card className="p-6">
          <p className="text-red-600">Error al cargar usuarios: {error.message}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
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

      {/* Search */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre, email o ciudad..."
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
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verificación
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.verified}
                onChange={(e) => handleFilterChange('verified', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="true">Verificados</option>
                <option value="false">No verificados</option>
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

      {/* Users Table */}
      <Card>
        <Card.Header>
          <Card.Title>
            Usuarios ({pagination.total || 0})
          </Card.Title>
        </Card.Header>
        <Card.Content className="p-0">
          {isLoading ? (
            <div className="p-8">
              <Loading.TableSkeleton rows={5} />
            </div>
          ) : users.length > 0 ? (
            <>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Usuario</Table.Head>
                    <Table.Head>Ubicación</Table.Head>
                    <Table.Head>Rating</Table.Head>
                    <Table.Head>Viajes</Table.Head>
                    <Table.Head>Estado</Table.Head>
                    <Table.Head>Registro</Table.Head>
                    <Table.Head>Acciones</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {users.map((user) => (
                    <Table.Row key={user._id}>
                      <Table.Cell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.firstName}
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
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <p className="text-sm text-gray-900">{user.city}</p>
                        <p className="text-sm text-gray-500">{user.province}</p>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {user.rating ? user.rating.toFixed(1) : 'N/A'}
                          </span>
                          <span className="text-yellow-400 ml-1">★</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <p className="text-sm text-gray-900">{user.totalTrips || 0}</p>
                      </Table.Cell>
                      <Table.Cell>
                        {getStatusBadge(user)}
                      </Table.Cell>
                      <Table.Cell>
                        <p className="text-sm text-gray-900">
                          {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: es })}
                        </p>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={() => viewUserDetails(user._id)}
                          />
                          {user.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<X className="w-4 h-4" />}
                              onClick={() => handleUserAction('deactivate', user._id)}
                              loading={deactivateUserMutation.isLoading}
                            />
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Check className="w-4 h-4" />}
                              onClick={() => handleUserAction('activate', user._id)}
                              loading={activateUserMutation.isLoading}
                            />
                          )}
                          {!user.isVerified && (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<UserPlus className="w-4 h-4" />}
                              onClick={() => handleUserAction('verify', user._id)}
                              loading={verifyUserMutation.isLoading}
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
                      {pagination.total} usuarios
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
            <Table.Empty message="No se encontraron usuarios" />
          )}
        </Card.Content>
      </Card>

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false)
          setSelectedUser(null)
        }}
        size="lg"
      >
        <Modal.Content>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detalles del Usuario
            </h3>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.firstName}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-bold">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h4>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    {getStatusBadge(selectedUser)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Teléfono
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Edad
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.age || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ciudad
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.city || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Provincia
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.province || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Rating
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.rating ? `${selectedUser.rating.toFixed(1)} ★` : 'Sin rating'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total de Viajes
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.totalTrips || 0}
                    </p>
                  </div>
                </div>

                {selectedUser.bio && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Biografía
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.bio}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Registro
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(new Date(selectedUser.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Modal.Content>
        <Modal.Footer>
          <Button
            variant="outline"
            onClick={() => {
              setShowUserModal(false)
              setSelectedUser(null)
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Users