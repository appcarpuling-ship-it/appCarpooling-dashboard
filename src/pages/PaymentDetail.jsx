import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Badge, Button } from '../components/common'
import { paymentService } from '../services'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { ArrowLeft, User, Check, RefreshCw } from 'lucide-react'

const Field = ({ label, value }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500">{label}</label>
    <div className="mt-0.5 text-sm text-gray-900">{value ?? 'N/A'}</div>
  </div>
)

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price ?? 0)

const getStatusBadge = (status) => {
  const map = {
    pending: { variant: 'warning', label: 'Pendiente' },
    completed: { variant: 'success', label: 'Completado' },
    failed: { variant: 'danger', label: 'Fallido' },
    refunded: { variant: 'info', label: 'Reembolsado' },
    cancelled: { variant: 'secondary', label: 'Cancelado' },
  }
  const c = map[status] || { variant: 'default', label: status }
  return <Badge variant={c.variant}>{c.label}</Badge>
}

const getMethodBadge = (method) => {
  const map = {
    mercadopago: { variant: 'primary', label: 'MercadoPago' },
    transfer: { variant: 'info', label: 'Transferencia' },
    cash: { variant: 'success', label: 'Efectivo' },
  }
  const c = map[method] || { variant: 'default', label: method || 'N/A' }
  return <Badge variant={c.variant}>{c.label}</Badge>
}

const PaymentDetail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const payment = location.state?.payment

  const confirmMutation = useMutation({
    mutationFn: () => paymentService.confirm(payment._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['payments-sent'])
      queryClient.invalidateQueries(['payments-received'])
      toast.success('Pago confirmado')
      navigate('/payments')
    },
    onError: () => toast.error('Error al confirmar pago'),
  })

  const refundMutation = useMutation({
    mutationFn: (reason) => paymentService.requestRefund(payment._id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['payments-sent'])
      queryClient.invalidateQueries(['payments-received'])
      toast.success('Reembolso solicitado')
      navigate('/payments')
    },
    onError: () => toast.error('Error al solicitar reembolso'),
  })

  const handleRefund = () => {
    const reason = window.prompt('Motivo del reembolso:')
    if (reason) refundMutation.mutate(reason)
  }

  if (!payment) {
    return (
      <div className="space-y-4">
        <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/payments')}>Volver</Button>
        <Card className="p-6"><p className="text-gray-500">No se encontró información del pago.</p></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/payments')}>
          Volver a pagos
        </Button>
        <div className="flex gap-2">
          {payment.status === 'pending' && (
            <Button size="sm" icon={<Check className="w-4 h-4" />} onClick={() => confirmMutation.mutate()} loading={confirmMutation.isLoading}>
              Confirmar pago
            </Button>
          )}
          {payment.status === 'completed' && (
            <Button variant="outline" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={handleRefund} loading={refundMutation.isLoading}>
              Solicitar reembolso
            </Button>
          )}
        </div>
      </div>

      {/* Info principal */}
      <Card>
        <Card.Content className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Pago #{payment._id?.slice(-8)}</h1>
              <div className="flex items-center gap-3 mt-2">
                {getStatusBadge(payment.status)}
                {getMethodBadge(payment.paymentMethod)}
                <Badge variant={payment.type === 'received' ? 'success' : 'info'}>
                  {payment.type === 'received' ? 'Recibido' : 'Enviado'}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${payment.type === 'received' ? 'text-green-600' : 'text-blue-600'}`}>
                {formatPrice(payment.amount)}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <Field label="Creado" value={payment.createdAt ? format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'} />
            <Field label="Actualizado" value={payment.updatedAt ? format(new Date(payment.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'} />
            <Field label="ID completo" value={<span className="font-mono text-xs break-all">{payment._id}</span>} />
          </div>
        </Card.Content>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Usuario */}
        <Card>
          <Card.Header><Card.Title>Usuario</Card.Title></Card.Header>
          <Card.Content className="p-6">
            <div className="flex items-center gap-4 mb-4">
              {payment.user?.avatar ? (
                <img src={payment.user.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{payment.user?.firstName} {payment.user?.lastName}</p>
                <p className="text-sm text-gray-500">{payment.user?.email}</p>
              </div>
            </div>
            <Field label="Teléfono" value={payment.user?.phone} />
            {payment.user?._id && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate(`/users/${payment.user._id}`)}>
                Ver perfil completo
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Reserva */}
        {payment.booking && (
          <Card>
            <Card.Header><Card.Title>Reserva asociada</Card.Title></Card.Header>
            <Card.Content className="p-6 space-y-3">
              <Field label="ID de reserva" value={<span className="font-mono text-xs">{payment.booking._id}</span>} />
              <Field label="Asientos" value={payment.booking.seatsBooked} />
              <Field label="Estado" value={
                <Badge variant={payment.booking.status === 'confirmed' ? 'success' : 'default'}>
                  {payment.booking.status}
                </Badge>
              } />
              {payment.booking._id && (
                <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate(`/bookings/${payment.booking._id}`)}>
                  Ver reserva completa
                </Button>
              )}
            </Card.Content>
          </Card>
        )}
      </div>

      {/* Datos adicionales del pago si existen */}
      {(payment.externalId || payment.reference || payment.notes) && (
        <Card>
          <Card.Header><Card.Title>Datos adicionales</Card.Title></Card.Header>
          <Card.Content className="p-6 space-y-3">
            {payment.externalId && <Field label="ID externo" value={<span className="font-mono">{payment.externalId}</span>} />}
            {payment.reference && <Field label="Referencia" value={payment.reference} />}
            {payment.notes && <Field label="Notas" value={payment.notes} />}
          </Card.Content>
        </Card>
      )}
    </div>
  )
}

export default PaymentDetail
