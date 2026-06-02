import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Badge, Button, Loading } from '../components/common'
import { commissionService } from '../services'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { ArrowLeft, User, Receipt, Calendar } from 'lucide-react'

const Field = ({ label, value }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500">{label}</label>
    <div className="mt-0.5 text-sm text-gray-900">{value ?? 'N/A'}</div>
  </div>
)

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price ?? 0)

const months = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const getStatusBadge = (status) => {
  const map = {
    pending: { variant: 'warning', label: 'Pendiente' },
    paid: { variant: 'success', label: 'Pagada' },
    waived: { variant: 'info', label: 'Eximida' },
    overdue: { variant: 'danger', label: 'Vencida' },
    notified: { variant: 'secondary', label: 'Notificado' },
  }
  const c = map[status] || { variant: 'default', label: status }
  return <Badge variant={c.variant}>{c.label}</Badge>
}

const CommissionDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['commission', id],
    queryFn: () => commissionService.getById(id),
  })

  const waiveMutation = useMutation({
    mutationFn: (reason) => commissionService.admin.waive(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['commission', id])
      toast.success('Comisión eximida')
    },
    onError: () => toast.error('Error al eximir comisión'),
  })

  const handleWaive = () => {
    const reason = window.prompt('Motivo para eximir la comisión:')
    if (reason) waiveMutation.mutate(reason)
  }

  if (isLoading) return <div className="space-y-4"><Loading.CardSkeleton /><Loading.CardSkeleton /></div>

  if (error) return (
    <div className="space-y-4">
      <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/commissions')}>Volver</Button>
      <Card className="p-6"><p className="text-red-600">Error al cargar la comisión</p></Card>
    </div>
  )

  const c = data.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/commissions')}>
          Volver a comisiones
        </Button>
        {(c.status === 'pending' || c.status === 'notified' || c.status === 'overdue') && (
          <Button variant="outline" size="sm" onClick={handleWaive} loading={waiveMutation.isLoading}>
            Eximir comisión
          </Button>
        )}
      </div>

      {/* Info principal */}
      <Card>
        <Card.Content className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Comisión — {months[c.month]} {c.year}
              </h1>
              <div className="mt-2">{getStatusBadge(c.status)}</div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{formatPrice(c.commissionAmount)}</p>
              <p className="text-xs text-gray-400 mt-1">Tasa: {(c.commissionRate * 100).toFixed(0)}% de {formatPrice(c.totalEarnings)}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <Field label="Total viajes" value={c.totalTrips} />
            <Field label="Ganancias totales" value={formatPrice(c.totalEarnings)} />
            <Field label="Vencimiento" value={c.dueDate ? format(new Date(c.dueDate), 'dd/MM/yyyy', { locale: es }) : 'N/A'} />
            <Field label="Moneda" value={c.currency} />
          </div>

          {c.status === 'paid' && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
              <p className="text-xs font-medium text-green-700 mb-2">Pago registrado</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Field label="Fecha de pago" value={c.paidDate ? format(new Date(c.paidDate), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'} />
                <Field label="Método" value={c.paymentMethod} />
                {c.paymentReference && <Field label="Referencia" value={<span className="font-mono">{c.paymentReference}</span>} />}
              </div>
              {c.receiptUrl && (
                <a href={c.receiptUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-green-700 underline">
                  Ver comprobante
                </a>
              )}
            </div>
          )}

          {c.notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Notas</p>
              <p className="text-sm text-gray-800">{c.notes}</p>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Conductor */}
      {c.driver && (
        <Card>
          <Card.Header><Card.Title>Conductor</Card.Title></Card.Header>
          <Card.Content className="p-6">
            <div className="flex items-center gap-4 mb-4">
              {c.driver.avatar ? (
                <img src={c.driver.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{c.driver.firstName} {c.driver.lastName}</p>
                <p className="text-sm text-gray-500">{c.driver.email}</p>
              </div>
            </div>
            {c.driver._id && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/users/${c.driver._id}`)}>
                Ver perfil completo
              </Button>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Viajes incluidos */}
      {c.trips?.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Viajes incluidos ({c.trips.length})</Card.Title>
          </Card.Header>
          <Card.Content className="p-0">
            <div className="divide-y divide-gray-100">
              {c.trips.map((t, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Receipt className="w-4 h-4 text-gray-400" />
                    <span className="font-mono text-xs text-gray-400">{t.tripId?.toString().slice(-8) || '—'}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {t.completedDate ? format(new Date(t.completedDate), 'dd/MM/yyyy', { locale: es }) : '—'}
                    </span>
                    <span className="font-medium text-gray-900">{formatPrice(t.actualCost)}</span>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/trips/${t.tripId}`)}>Ver</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Notificaciones */}
      <Card>
        <Card.Header><Card.Title>Historial de notificaciones</Card.Title></Card.Header>
        <Card.Content className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Notificación enviada" value={c.notificationSent ? '✓ Sí' : '✗ No'} />
            <Field label="Recordatorios enviados" value={c.remindersSent ?? 0} />
            <Field label="Último recordatorio" value={c.lastReminderDate ? format(new Date(c.lastReminderDate), 'dd/MM/yyyy HH:mm', { locale: es }) : '—'} />
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}

export default CommissionDetail
