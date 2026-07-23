import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import parametrosService from '../services/parametrosService'
import toast from 'react-hot-toast'

const EMPTY = { montoPorTramo: '', kmPorTramo: '', montoMinimo: '' }

const Settings = () => {
  const [form, setForm]       = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await parametrosService.getCostoViaje()
      const { montoPorTramo, kmPorTramo, montoMinimo } = res.data || {}
      setForm({ montoPorTramo, kmPorTramo, montoMinimo })
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
        montoPorTramo: Number(form.montoPorTramo),
        kmPorTramo: Number(form.kmPorTramo),
        montoMinimo: Number(form.montoMinimo),
      })
      toast.success('Parámetros actualizados')
    } catch (err) {
      toast.error('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">Parámetro de costo de viaje</p>
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
              <label className="block text-sm font-medium text-slate-700">Monto por tramo</label>
              <input name="montoPorTramo" type="number" step="0.01" value={form.montoPorTramo}
                onChange={handleChange} className="input" required />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Km por tramo</label>
              <input name="kmPorTramo" type="number" step="0.01" value={form.kmPorTramo}
                onChange={handleChange} className="input" required />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Monto mínimo</label>
              <input name="montoMinimo" type="number" step="0.01" value={form.montoMinimo}
                onChange={handleChange} className="input" required />
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn btn-primary">
                <Save className="w-4 h-4" />
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Settings
