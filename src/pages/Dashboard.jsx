import { useQuery } from '@tanstack/react-query'
import { adminService } from '../services'
import { Card, Loading, Badge } from '../components/common'
import { Users, Car, Calendar, CreditCard, TrendingUp, DollarSign } from 'lucide-react'

const Dashboard = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: adminService.getPlatformStats,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Loading.CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Card className="p-6 text-center">
          <p className="text-red-600">Error al cargar las estadísticas</p>
          <p className="text-gray-500 text-sm mt-2">{error.message}</p>
        </Card>
      </div>
    )
  }

  const statsData = stats?.data || {}

  const metrics = [
    {
      title: 'Total Usuarios',
      value: statsData.totalUsers || 0,
      icon: Users,
      color: 'primary',
      change: `+${statsData.growthMetrics?.usersThisMonth || 0} este mes`,
    },
    {
      title: 'Usuarios Activos',
      value: statsData.activeUsers || 0,
      icon: TrendingUp,
      color: 'success',
      change: 'Últimos 30 días',
    },
    {
      title: 'Total Viajes',
      value: statsData.totalTrips || 0,
      icon: Car,
      color: 'warning',
      change: `+${statsData.growthMetrics?.tripsThisMonth || 0} este mes`,
    },
    {
      title: 'Viajes Activos',
      value: statsData.activeTrips || 0,
      icon: Calendar,
      color: 'info',
      change: 'En curso',
    },
    {
      title: 'Total Reservas',
      value: statsData.totalBookings || 0,
      icon: Calendar,
      color: 'secondary',
      change: 'Históricas',
    },
    {
      title: 'Ingresos Totales',
      value: `$${(statsData.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'success',
      change: 'ARS',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Resumen general de la plataforma Carpooling Argentina
          </p>
        </div>
        <Badge variant="success">En tiempo real</Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index} className="p-6" hover>
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-${metric.color}-100`}>
                  <Icon className={`h-6 w-6 text-${metric.color}-600`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {metric.change}
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Acciones Rápidas</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Users className="h-6 w-6 text-primary-600 mb-2" />
                <p className="font-medium text-gray-900">Gestionar Usuarios</p>
                <p className="text-sm text-gray-500">Ver y administrar usuarios</p>
              </button>

              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Car className="h-6 w-6 text-warning-600 mb-2" />
                <p className="font-medium text-gray-900">Ver Viajes</p>
                <p className="text-sm text-gray-500">Monitorear viajes activos</p>
              </button>

              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <CreditCard className="h-6 w-6 text-success-600 mb-2" />
                <p className="font-medium text-gray-900">Pagos</p>
                <p className="text-sm text-gray-500">Revisar transacciones</p>
              </button>

              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <TrendingUp className="h-6 w-6 text-info-600 mb-2" />
                <p className="font-medium text-gray-900">Analítica</p>
                <p className="text-sm text-gray-500">Ver informes detallados</p>
              </button>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Actividad Reciente</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Nuevo usuario registrado
                  </p>
                  <p className="text-xs text-gray-500">Hace 2 minutos</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Viaje completado exitosamente
                  </p>
                  <p className="text-xs text-gray-500">Hace 5 minutos</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Pago procesado
                  </p>
                  <p className="text-xs text-gray-500">Hace 12 minutos</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Nueva reseña publicada
                  </p>
                  <p className="text-xs text-gray-500">Hace 18 minutos</p>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard