import { useState, useEffect } from 'react'
import { Save, X } from 'lucide-react'

const TYPE_OPTIONS = [
  { value: 'free_trip',    label: 'Viaje gratis' },
  { value: 'percentage',   label: 'Porcentaje' },
  { value: 'fixed_amount', label: 'Monto fijo' },
]

const EMPTY = {
  code: '',
  type: 'percentage',
  value: '',
  description: '',
  maxUses: '',
  expiresAt: '',
}

const Field = ({ label, error, children, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    {children}
    {hint  && <p className="text-xs text-slate-400">{hint}</p>}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

const CouponForm = ({ coupon, onSubmit, onCancel }) => {
  const [form, setForm]     = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (coupon) {
      setForm({
        code: coupon.code || '',
        type: coupon.type || 'percentage',
        value: coupon.value ?? '',
        description: coupon.description || '',
        maxUses: coupon.maxUses ?? '',
        expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
      })
    } else {
      setForm(EMPTY)
    }
  }, [coupon])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.code.trim()) e.code = 'El código es requerido'
    if (form.type !== 'free_trip' && (form.value === '' || Number(form.value) <= 0)) {
      e.value = 'Ingresá un valor mayor a 0'
    }
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: form.type === 'free_trip' ? 0 : Number(form.value),
        description: form.description.trim(),
        maxUses: form.maxUses === '' ? null : Number(form.maxUses),
        expiresAt: form.expiresAt || null,
      }
      coupon?._id ? await onSubmit(coupon._id, payload) : await onSubmit(payload)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  const inputCls = (key) => `input ${errors[key] ? 'border-red-400 focus:ring-red-400' : ''}`

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-0">
      <div className="p-6 space-y-5">

        <Field label="Código *" error={errors.code}>
          <input name="code" type="text" value={form.code} onChange={handleChange}
            className={inputCls('code')} placeholder="Ej: BIENVENIDA20" />
        </Field>

        <Field label="Tipo *">
          <select name="type" value={form.type} onChange={handleChange} className="input bg-white">
            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        {form.type !== 'free_trip' && (
          <Field label="Valor *" error={errors.value}
            hint={form.type === 'percentage' ? 'Porcentaje de descuento (0-100)' : 'Monto fijo de descuento'}>
            <input name="value" type="number" min="0" step="0.01" value={form.value} onChange={handleChange}
              className={inputCls('value')} />
          </Field>
        )}

        <Field label="Descripción">
          <textarea name="description" value={form.description} onChange={handleChange}
            className="input h-auto py-2 resize-none" rows={2}
            placeholder="Descripción visible para el usuario…" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Usos máximos" hint="Vacío = ilimitado">
            <input name="maxUses" type="number" min="1" value={form.maxUses} onChange={handleChange} className="input" />
          </Field>

          <Field label="Vencimiento" hint="Vacío = sin vencimiento">
            <input name="expiresAt" type="date" value={form.expiresAt} onChange={handleChange} className="input" />
          </Field>
        </div>
      </div>

      {errors.submit && (
        <div className="mx-6 my-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {errors.submit}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-white">
        <button type="button" onClick={onCancel} disabled={loading} className="btn btn-secondary">
          <X className="w-4 h-4" /> Cancelar
        </button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          <Save className="w-4 h-4" />
          {loading ? 'Guardando…' : coupon ? 'Actualizar' : 'Crear cupón'}
        </button>
      </div>
    </form>
  )
}

export default CouponForm
