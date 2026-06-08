import { useState, useEffect } from 'react'
import { Save, X, ChevronDown, ChevronUp, RefreshCw, Link } from 'lucide-react'
import { getRandomPlaceholder, getSvgPlaceholder } from '../../constants/placeholders'
import { sanitizeImageUrl } from '../../utils/imageUtils'

const APP_GOTO_OPTIONS = [
  { value: '',                     label: '— Sin navegación —' },
  { value: 'home',                 label: 'Inicio' },
  { value: 'all_trips',            label: 'Ver todos los viajes' },
  { value: 'search_trips',         label: 'Buscar viajes' },
  { value: 'create_trip',          label: 'Crear viaje' },
  { value: 'my_trips',             label: 'Mis viajes' },
  { value: 'my_bookings',          label: 'Mis reservas' },
  { value: 'my_seat_reservations', label: 'Reservas de asiento' },
  { value: 'profile',              label: 'Mi perfil' },
]

const WEB_GOTO_OPTIONS = [
  { value: '',                   label: '— Sin navegación —' },
  { value: '/',                  label: 'Inicio' },
  { value: '/trips/search',      label: 'Buscar viajes' },
  { value: '/trips/create',      label: 'Crear viaje' },
  { value: '/my-trips',          label: 'Mis viajes' },
  { value: '/bookings',          label: 'Mis reservas' },
  { value: '/seat-reservations', label: 'Reservas de asiento' },
  { value: '/profile',           label: 'Mi perfil' },
]

const EMPTY = {
  sectionTitle: '',
  title: '',
  texto: '',
  imageUrl: '',
  hipervinculo: false,
  textHipervinculo: '',
  clickUrl: '',
  webGoTo: '',
  appGoTo: '',
  order: 0,
  visibility: { userTypes: 'both', devices: 'both' },
}

const Field = ({ label, error, children, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    {children}
    {hint  && <p className="text-xs text-slate-400">{hint}</p>}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

const Select = ({ value, onChange, options, name, className = '' }) => (
  <select name={name} value={value} onChange={onChange} className={`input bg-white ${className}`}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
)

const BannerForm = ({ banner, currentSection, sections = [], onSubmit, onCancel }) => {
  const [form, setForm]         = useState(EMPTY)
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [advanced, setAdvanced] = useState(false)

  useEffect(() => {
    if (banner) {
      setForm({
        ...EMPTY,
        ...banner,
        sectionTitle: banner.sectionTitle || currentSection || '',
        hipervinculo: banner.hipervinculo ?? false,
        textHipervinculo: banner.textHipervinculo || '',
        texto: banner.texto || '',
        visibility: banner.visibility || EMPTY.visibility,
      })
    } else {
      setForm({ ...EMPTY, sectionTitle: currentSection || '' })
    }
  }, [banner, currentSection])

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))
  const setNested = (root, key, val) => setForm(p => ({ ...p, [root]: { ...p[root], [key]: val } }))

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    set(name, type === 'checkbox' ? checked : value)
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }))
  }

  const handleImageFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { set('imageUrl', ev.target.result); setErrors(p => ({ ...p, imageUrl: null })) }
    reader.readAsDataURL(file)
  }

  const validate = () => {
    const e = {}
    if (!form.sectionTitle.trim()) e.sectionTitle = 'La sección es requerida'
    if (!form.title.trim())        e.title        = 'El título es requerido'
    if (!form.imageUrl.trim())     e.imageUrl     = 'La imagen es requerida'
    if (form.clickUrl.trim()) {
      try { new URL(form.clickUrl) } catch { e.clickUrl = 'URL inválida' }
    }
    if (form.hipervinculo && !form.textHipervinculo.trim()) {
      e.textHipervinculo = 'Escribí el texto del botón de hipervínculo'
    }
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      banner?._id ? await onSubmit(banner._id, form) : await onSubmit(form)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  const inputCls = (key) => `input ${errors[key] ? 'border-red-400 focus:ring-red-400' : ''}`

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-0">

      {/* ── Essentials ── */}
      <div className="p-6 space-y-5">

        {/* Sección */}
        <Field label="Sección *" error={errors.sectionTitle}
          hint="Nombre de la sección donde aparecerá este banner">
          {sections.length > 0 ? (
            <div className="flex gap-2">
              <Select
                name="sectionTitle"
                value={form.sectionTitle}
                onChange={handleChange}
                options={[
                  { value: '', label: '— Seleccioná una sección —' },
                  ...sections.map(s => ({ value: s, label: s })),
                ]}
                className={errors.sectionTitle ? 'border-red-400' : ''}
              />
            </div>
          ) : (
            <input name="sectionTitle" type="text" value={form.sectionTitle} onChange={handleChange}
              className={inputCls('sectionTitle')} placeholder="Ej: Ofertas, Inicio, Novedades…" />
          )}
        </Field>

        {/* Título */}
        <Field label="Título *" error={errors.title}>
          <input name="title" type="text" value={form.title} onChange={handleChange}
            className={inputCls('title')} placeholder="Ej: ¡Viajá con Carpuling este verano!" />
        </Field>

        {/* Texto / descripción */}
        <Field label="Texto" hint="Se muestra en el modal al abrir el banner">
          <textarea name="texto" value={form.texto} onChange={handleChange}
            className="input h-auto py-2 resize-none" rows={3}
            placeholder="Describí la oferta, novedad o mensaje del banner…" />
        </Field>

        {/* Imagen */}
        <Field label="Imagen *" error={errors.imageUrl}>
          <div className="flex gap-2">
            <label className="flex-1">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
              <div className={`input cursor-pointer flex items-center gap-2 text-slate-400 text-sm
                              ${errors.imageUrl ? 'border-red-400' : ''}`}>
                <span className="truncate">{form.imageUrl ? '✓ Imagen cargada' : 'Seleccionar imagen…'}</span>
              </div>
            </label>
            <button type="button"
              onClick={() => { set('imageUrl', getRandomPlaceholder('banner')); setErrors(p => ({ ...p, imageUrl: null })) }}
              className="btn btn-ghost border border-slate-200 px-3 text-xs text-slateite-500 whitespace-nowrap">
              <RefreshCw className="w-3.5 h-3.5" /> Demo
            </button>
          </div>
          {form.imageUrl && (
            <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 h-36 flex items-center justify-center">
              <img src={sanitizeImageUrl(form.imageUrl) || form.imageUrl} alt=""
                className="h-full w-full object-contain"
                onError={e => { e.target.src = getSvgPlaceholder(400, 144) }} />
            </div>
          )}
        </Field>

        {/* Hipervínculo toggle */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="hipervinculo"
              checked={form.hipervinculo}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-300 rounded-full peer
                            peer-checked:bg-indigo-600 transition-colors
                            after:content-[''] after:absolute after:top-0.5 after:left-0.5
                            after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all
                            peer-checked:after:translate-x-5" />
          </label>
          <div>
            <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-indigo-500" /> Agregar hipervínculo
            </p>
            <p className="text-xs text-slate-400">Muestra un botón de enlace en el modal del banner</p>
          </div>
        </div>

        {/* Campos de hipervínculo (solo si está activo) */}
        {form.hipervinculo && (
          <div className="space-y-4 pl-3 border-l-2 border-indigo-200">
            <Field label="Texto del botón *" error={errors.textHipervinculo}>
              <input name="textHipervinculo" type="text" value={form.textHipervinculo} onChange={handleChange}
                className={inputCls('textHipervinculo')} placeholder="Ej: Ver más, Reservar ahora, Conocé la oferta…" />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="App — ir a">
                <Select name="appGoTo" value={form.appGoTo} options={APP_GOTO_OPTIONS}
                  onChange={e => set('appGoTo', e.target.value)} />
              </Field>
              <Field label="Web — ir a">
                <Select name="webGoTo" value={form.webGoTo} options={WEB_GOTO_OPTIONS}
                  onChange={e => set('webGoTo', e.target.value)} />
              </Field>
            </div>

            <Field label="URL externa" error={errors.clickUrl} hint="Fallback si no hay ruta interna">
              <input name="clickUrl" type="url" value={form.clickUrl} onChange={handleChange}
                className={inputCls('clickUrl')} placeholder="https://…" />
            </Field>
          </div>
        )}
      </div>

      {/* ── Advanced toggle ── */}
      <button type="button" onClick={() => setAdvanced(v => !v)}
        className="flex items-center justify-between w-full px-6 py-3 text-sm font-medium
                   text-slate-500 hover:text-slate-700 border-y border-slate-100
                   hover:bg-slate-50 transition-colors">
        <span>Opciones avanzadas</span>
        {advanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {advanced && (
        <div className="p-6 space-y-5 bg-slate-50/60">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Orden" hint="Ascendente">
              <input name="order" type="number" min="0" value={form.order} onChange={handleChange} className="input" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Usuarios">
              <Select value={form.visibility.userTypes}
                onChange={e => setNested('visibility', 'userTypes', e.target.value)}
                options={[
                  { value: 'both',      label: 'Todos' },
                  { value: 'driver',    label: 'Solo conductores' },
                  { value: 'passenger', label: 'Solo pasajeros' },
                ]} />
            </Field>
            <Field label="Dispositivos">
              <Select value={form.visibility.devices}
                onChange={e => setNested('visibility', 'devices', e.target.value)}
                options={[
                  { value: 'both',   label: 'Todos' },
                  { value: 'mobile', label: 'Solo móvil' },
                  { value: 'web',    label: 'Solo web' },
                ]} />
            </Field>
          </div>
        </div>
      )}

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
          {loading ? 'Guardando…' : banner ? 'Actualizar' : 'Crear banner'}
        </button>
      </div>
    </form>
  )
}

export default BannerForm
