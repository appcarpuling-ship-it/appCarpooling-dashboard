import { Edit, Trash2, ToggleRight, ToggleLeft } from 'lucide-react'

const formatValue = (coupon) => {
  if (coupon.type === 'free_trip') return 'Viaje gratis'
  if (coupon.type === 'percentage') return `${coupon.value}%`
  if (coupon.type === 'fixed_amount') return `$${coupon.value}`
  return coupon.value
}

const TYPE_LABEL = {
  free_trip: 'Viaje gratis',
  percentage: 'Porcentaje',
  fixed_amount: 'Monto fijo',
}

const CouponList = ({ coupons, onToggleStatus, onEdit, onDelete }) => {
  if (coupons.length === 0) {
    return (
      <div className="card p-16 flex flex-col items-center gap-3 text-slate-400">
        <p className="text-sm">No hay cupones para mostrar</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <th className="px-4 py-3">Código</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Valor</th>
            <th className="px-4 py-3">Usos</th>
            <th className="px-4 py-3">Vence</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {coupons.map((c) => (
            <tr key={c._id} className={!c.isActive ? 'opacity-50' : ''}>
              <td className="px-4 py-3 font-semibold text-slate-900">{c.code}</td>
              <td className="px-4 py-3 text-slate-600">{TYPE_LABEL[c.type] || c.type}</td>
              <td className="px-4 py-3 text-slate-600">{formatValue(c)}</td>
              <td className="px-4 py-3 text-slate-600">
                {c.usesCount ?? 0} / {c.maxUses ?? '∞'}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('es-AR') : 'Sin vencimiento'}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                  ${c.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  {c.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    onClick={() => onToggleStatus(c._id)}
                    title={c.isActive ? 'Desactivar' : 'Activar'}>
                    {c.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    onClick={() => onEdit(c)}
                    title="Editar">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => onDelete(c._id)}
                    title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CouponList
