import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Badge, Button, Loading } from '../components/common'
import { adminService } from '../services'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { ArrowLeft, User, Check, X, UserPlus } from 'lucide-react'

const Field = ({ label, value }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500">{label}</label>
    <p className="mt-0.5 text-sm text-gray-900">{value ?? 'N/A'}</p>
  </div>
)

const StatCard = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-4 text-center">
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-500 mt-1">{label}</p>
  </div>
)

const UserDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => adminService.users.getById(id),
  })

  const activateMutation = useMutation({
    mutationFn: () => adminService.users.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-user', id])
      toast.success('Usuario activado')
    },
    onError: () => toast.error('Error al activar usuario'),
  })

  const deactivateMutation = useMutation({
    mutationFn: () => adminService.users.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-user', id])
      toast.success('Usuario desactivado')
    },
    onError: () => toast.error('Error al desactivar usuario'),
  })

  const verifyMutation = useMutation({
    mutationFn: () => adminService.users.verify(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-user', id])
      toast.success('Usuario verificado')
    },
    onError: () => toast.error('Error al verificar usuario'),
  })

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
        <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/users')}>
          Volver
        </Button>
        <Card className="p-6">
          <p className="text-red-600">Error al cargar el usuario</p>
        </Card>
      </div>
    )
  }

  const user = data.data.user
  const stats = data.data.stats

  const getStatusBadge = () => {
    if (!user.isActive) return <Badge variant="danger">Inactivo</Badge>
    if (!user.verified) return <Badge variant="warning">No verificado</Badge>
    return <Badge variant="success">Activo</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/users')}>
          Volver a usuarios
        </Button>
        <div className="flex gap-2">
          {!user.verified && (
            <Button
              variant="primary"
              size="sm"
              icon={<UserPlus className="w-4 h-4" />}
              onClick={() => verifyMutation.mutate()}
              loading={verifyMutation.isLoading}
            >
              Verificar
            </Button>
          )}
          {user.isActive ? (
            <Button
              variant="outline"
              size="sm"
              icon={<X className="w-4 h-4" />}
              onClick={() => deactivateMutation.mutate()}
              loading={deactivateMutation.isLoading}
            >
              Desactivar
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon={<Check className="w-4 h-4" />}
              onClick={() => activateMutation.mutate()}
              loading={activateMutation.isLoading}
            >
              Activar
            </Button>
          )}
        </div>
      </div>

      {/* Perfil */}
      <Card>
        <Card.Content className="p-6">
          <div className="flex items-center space-x-5">
            {user.avatar ? (
              <img src={user.avatar} alt={user.firstName} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-gray-500" />
              </div>
            )}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-400 capitalize">
                {user.role} · {user.gender === 'male' ? 'Masculino' : user.gender === 'female' ? 'Femenino' : '—'}
              </p>
              <div className="pt-1">{getStatusBadge()}</div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Rating ★" value={user.rating ? user.rating.toFixed(1) : '—'} />
        <StatCard label="Viajes como conductor" value={stats?.totalTripsAsDriver ?? 0} />
        <StatCard label="Viajes como pasajero" value={stats?.totalTripsAsPassenger ?? 0} />
        <StatCard label="Vehículos" value={stats?.totalVehicles ?? 0} />
      </div>

      {/* Info personal + contacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Información personal</Card.Title>
          </Card.Header>
          <Card.Content className="p-6 space-y-4">
            <Field label="Teléfono" value={
              <span>
                {user.phone || 'N/A'}
                {user.phoneVerified && <span className="ml-2 text-green-600 text-xs">✓ verificado</span>}
              </span>
            } />
            <Field label="Email" value={
              <span>
                {user.email}
                {user.emailVerified && <span className="ml-2 text-green-600 text-xs">✓ verificado</span>}
              </span>
            } />
            <Field label="Edad" value={user.age} />
            <Field label="Ciudad" value={user.city} />
            <Field label="Provincia" value={user.province} />
            {user.bio && <Field label="Biografía" value={user.bio} />}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Cuenta</Card.Title>
          </Card.Header>
          <Card.Content className="p-6 space-y-4">
            <Field label="Fecha de registro" value={
              user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'
            } />
            <Field label="Última actividad" value={
              user.updatedAt ? format(new Date(user.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'
            } />
            <Field label="Código referido" value={<span className="font-mono">{user.referralCode}</span>} />
            <Field label="Referidos" value={user.referralCount ?? 0} />
            <Field label="Descuento activo" value={`${user.discountPercentage ?? 0}%`} />
            {user.clientDevice && (
              <>
                <Field label="Plataforma" value={<span className="capitalize">{user.clientDevice.platform}</span>} />
                <Field label="Versión app" value={user.clientDevice.appVersion} />
              </>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* DNI */}
      {(user.dniFrontUrl || user.dniBackUrl) && (
        <Card>
          <Card.Header>
            <Card.Title>Documentos DNI</Card.Title>
          </Card.Header>
          <Card.Content className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.dniFrontUrl && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Frente</p>
                  <a href={user.dniFrontUrl} target="_blank" rel="noopener noreferrer">
                    <img src={user.dniFrontUrl} alt="DNI frente" className="rounded-lg border border-gray-200 w-full object-cover max-h-56 hover:opacity-90 transition-opacity" />
                  </a>
                </div>
              )}
              {user.dniBackUrl && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Dorso</p>
                  <a href={user.dniBackUrl} target="_blank" rel="noopener noreferrer">
                    <img src={user.dniBackUrl} alt="DNI dorso" className="rounded-lg border border-gray-200 w-full object-cover max-h-56 hover:opacity-90 transition-opacity" />
                  </a>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  )
}

export default UserDetail
