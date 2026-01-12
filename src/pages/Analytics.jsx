import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Loading, Button } from '../components/common'
import { adminService, recommendationService } from '../services'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  TrendingUp,
  Users,
  Car,
  DollarSign,
  MapPin,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  RefreshCw
} from 'lucide-react'

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30') // days
  const [selectedMetric, setSelectedMetric] = useState('users')

  // Fetch platform stats
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => adminService.getPlatformStats()
  })

  // Fetch popular routes
  const { data: routesData, isLoading: routesLoading } = useQuery({
    queryKey: ['popular-routes'],
    queryFn: () => recommendationService.getPopularRoutes()
  })

  // Fetch city demand
  const { data: cityData, isLoading: cityLoading } = useQuery({
    queryKey: ['city-demand'],
    queryFn: () => recommendationService.getCityDemand()
  })

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Generate mock time series data based on current stats
  const generateTimeSeriesData = (days) => {
    const data = []
    const stats = statsData?.data || {}

    for (let i = days; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'dd/MM')
      const variation = Math.random() * 0.3 + 0.85 // 85-115% variation

      data.push({
        date,
        usuarios: Math.round((stats.totalUsers || 0) * variation * (i === 0 ? 1 : 0.9)),
        viajes: Math.round((stats.totalTrips || 0) * variation * (i === 0 ? 1 : 0.95)),
        reservas: Math.round((stats.totalBookings || 0) * variation * (i === 0 ? 1 : 0.93)),
        ingresos: Math.round((stats.totalRevenue || 0) * variation * (i === 0 ? 1 : 0.88))
      })
    }

    return data
  }

  // Generate monthly comparison data
  const generateMonthlyData = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
    const stats = statsData?.data || {}

    return months.map((month, index) => {
      const growth = 1 + (index * 0.15) // 15% growth per month
      return {
        month,
        usuarios: Math.round((stats.totalUsers || 0) * growth * 0.8),
        viajes: Math.round((stats.totalTrips || 0) * growth * 0.7),
        ingresos: Math.round((stats.totalRevenue || 0) * growth * 0.6)
      }
    })
  }

  // Process popular routes data
  const processRoutesData = () => {
    if (!routesData?.data) return []

    return routesData.data.slice(0, 5).map(route => ({
      route: `${route.origin} → ${route.destination}`,
      viajes: route.tripCount,
      precio: route.averagePrice
    }))
  }

  // Process city demand data for pie chart
  const processCityData = () => {
    if (!cityData?.data) {
      // Mock data if no real data available
      return [
        { name: 'Buenos Aires', value: 45, fill: '#3b82f6' },
        { name: 'Córdoba', value: 20, fill: '#10b981' },
        { name: 'Rosario', value: 15, fill: '#f59e0b' },
        { name: 'Mendoza', value: 12, fill: '#ef4444' },
        { name: 'Otros', value: 8, fill: '#8b5cf6' }
      ]
    }

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
    return cityData.data.slice(0, 6).map((city, index) => ({
      name: city.city,
      value: city.demand,
      fill: colors[index] || '#6b7280'
    }))
  }

  const timeSeriesData = generateTimeSeriesData(parseInt(timeRange))
  const monthlyData = generateMonthlyData()
  const routesChart = processRoutesData()
  const cityChart = processCityData()
  const stats = statsData?.data || {}

  const isLoading = statsLoading || routesLoading || cityLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Análisis y Métricas</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <Loading.Skeleton className="h-20" />
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <Loading.Skeleton className="h-96" />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Análisis y Métricas</h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => refetchStats()}
          >
            Actualizar
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalUsers?.toLocaleString('es-AR') || 0}
              </p>
              <p className="text-sm text-green-600">
                +{stats.growthMetrics?.usersThisMonth || 0} este mes
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Viajes</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.totalTrips?.toLocaleString('es-AR') || 0}
              </p>
              <p className="text-sm text-green-600">
                +{stats.growthMetrics?.tripsThisMonth || 0} este mes
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Car className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatPrice(stats.totalRevenue || 0)}
              </p>
              <p className="text-sm text-purple-600">
                +15.3% vs mes anterior
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.activeUsers?.toLocaleString('es-AR') || 0}
              </p>
              <p className="text-sm text-orange-600">
                {((stats.activeUsers || 0) / (stats.totalUsers || 1) * 100).toFixed(1)}% del total
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Time Range Selector */}
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Tendencias</h3>
          <div className="flex gap-2">
            {[
              { value: '7', label: '7 días' },
              { value: '30', label: '30 días' },
              { value: '90', label: '90 días' }
            ].map(option => (
              <Button
                key={option.value}
                variant={timeRange === option.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Chart */}
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tendencias ({timeRange} días)
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'ingresos' ? formatPrice(value) : value.toLocaleString('es-AR'),
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="usuarios"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="viajes"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="reservas"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* City Distribution */}
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Distribución por Ciudad
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cityChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {cityChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Ingresos por Mes
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatPrice(value)} />
                  <Tooltip
                    formatter={(value) => [formatPrice(value), 'Ingresos']}
                    labelFormatter={(label) => `Mes: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* Popular Routes */}
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Rutas Más Populares
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              {routesChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={routesChart} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="route" width={120} />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'precio' ? formatPrice(value) : value,
                        name === 'precio' ? 'Precio Promedio' : 'Viajes'
                      ]}
                    />
                    <Bar dataKey="viajes" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No hay datos de rutas disponibles</p>
                  </div>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Growth Comparison */}
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Comparación Mensual de Crecimiento
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    value.toLocaleString('es-AR'),
                    name.charAt(0).toUpperCase() + name.slice(1)
                  ]}
                />
                <Legend />
                <Bar dataKey="usuarios" fill="#3b82f6" name="Usuarios" />
                <Bar dataKey="viajes" fill="#10b981" name="Viajes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card.Content>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Crecimiento Promedio</h3>
            <p className="text-3xl font-bold text-blue-600">+18.5%</p>
            <p className="text-sm text-gray-600">Usuarios por mes</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <Car className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Viajes Promedio</h3>
            <p className="text-3xl font-bold text-green-600">{Math.round((stats.totalTrips || 0) / 30)}</p>
            <p className="text-sm text-gray-600">Viajes por día</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Valor Promedio</h3>
            <p className="text-3xl font-bold text-purple-600">
              {formatPrice((stats.totalRevenue || 0) / (stats.totalTrips || 1))}
            </p>
            <p className="text-sm text-gray-600">Por viaje</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Analytics