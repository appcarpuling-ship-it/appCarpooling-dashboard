import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import parametrosService from '../services/parametrosService'
import toast from 'react-hot-toast'

const EMPTY = { modo: 'parametrizado', montoPorTramo: '', kmPorTramo: '', montoFijo: '' }

const Settings = () => {
  const [form, setForm]       = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [supportEmail, setSupportEmail]   = useState('')
  const [savingEmail, setSavingEmail]     = useState(false)
  const [whatsapp, setWhatsapp]           = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await parametrosService.getCostoViaje()
      const { modo, montoPorTramo, kmPorTramo, montoFijo } = res.data || {}
      setForm({ modo: modo || 'parametrizado', montoPorTramo, kmPorTramo, montoFijo })

      const mail = await parametrosService.getSupportEmail()
      setSupportEmail(mail.data?.supportEmail || '')

      const wsp = await parametrosService.getSupportWhatsapp()
      setWhatsapp(wsp.data?.supportWhatsapp || '')
    } catch (err) {
      toast.error('Error al cargar parámetros: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await parametrosService.updateCostoViaje({
        modo: form.modo,
        montoPorTramo: Number(form.montoPorTramo),
        kmPorTramo: Number(form.kmPorTramo),
        montoFijo: Number(form.montoFijo),
      })
      toast.success('Parámetros actualizados')
    } catch (err) {
      toast.error('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitEmail = async (e) => {
    e.preventDefault()
    setSavingEmail(true)
    try {
      await parametrosService.updateSupportEmail(supportEmail.trim())
      await parametrosService.updateSupportWhatsapp(whatsapp)
      toast.success('Datos de soporte actualizados')
    } catch (err) {
      toast.error('Error al guardar: ' + err.message)
    } finally {
      setSavingEmail(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">Costo de viaje y datos de soporte</p>
        </div>
      </div>

      <div className="card p-6 max-w-md">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-slate-400 py-10">
            <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
            <span className="text-sm">Cargando…</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Modo de cobro</label>
              <select name="modo" value={form.modo} onChange={handleChange} className="input">
                <option value="parametrizado">Parametrizado por distancia</option>
                <option value="fijo">Precio fijo</option>
              </select>
            </div>

            {form.modo === 'fijo' ? (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Monto fijo por asiento</label>
                <input name="montoFijo" type="number" step="0.01" min="0" value={form.montoFijo}
                  onChange={handleChange} className="input" required />
                <p className="text-xs text-slate-500">Se cobra siempre lo mismo, sin importar la distancia.</p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Monto por tramo</label>
                  <input name="montoPorTramo" type="number" step="0.01" min="0" value={form.montoPorTramo}
                    onChange={handleChange} className="input" required />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Km por tramo</label>
                  <input name="kmPorTramo" type="number" step="0.01" min="1" value={form.kmPorTramo}
                    onChange={handleChange} className="input" required />
                </div>

                <p className="text-xs text-slate-500">
                  ${form.montoPorTramo || 0} cada {form.kmPorTramo || 0}km por asiento, y ese monto
                  es también el piso: un viaje más corto que {form.kmPorTramo || 0}km paga ${form.montoPorTramo || 0}.
                </p>
              </>
            )}

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn btn-primary">
                <Save className="w-4 h-4" />
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card p-6 max-w-md">
        <form onSubmit={handleSubmitEmail} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Correo de soporte</label>
            <input
              name="supportEmail"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="input"
              placeholder="soporte@carpuling.com.ar"
              required
            />
            <p className="text-xs text-slate-500">
              Es el correo que ve un usuario al que le bloquearon la cuenta, para
              poder reclamar. Se muestra en la app apenas intenta entrar.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">WhatsApp de soporte</label>
            <input
              name="supportWhatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="input"
              placeholder="+54 9 345 4955395"
              required
            />
            <p className="text-xs text-slate-500">
              Con código de país. Se guardan solo los dígitos, así que podés escribirlo
              con +, espacios o guiones. El usuario abre el chat con un mensaje ya escrito.
            </p>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={savingEmail} className="btn btn-primary">
              <Save className="w-4 h-4" />
              {savingEmail ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Settings
