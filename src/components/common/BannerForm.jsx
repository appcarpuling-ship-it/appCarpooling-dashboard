import { useState, useEffect } from 'react'
import { Save, X, ChevronDown, ChevronUp, Trash2, RefreshCw } from 'lucide-react'
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
  { value: '',                  label: '— Sin navegación —' },
  { value: '/',                 label: 'Inicio' },
  { value: '/trips/search',     label: 'Buscar viajes' },
  { value: '/trips/create',     label: 'Crear viaje' },
  { value: '/my-trips',         label: 'Mis viajes' },
  { value: '/bookings',         label: 'Mis reservas' },
  { value: '/seat-reservations',label: 'Reservas de asiento' },
  { value: '/profile',          label: 'Mi perfil' },
]

const EMPTY = {
  title: '', description: '', imageUrl: '', clickUrl: '',
  buttonText: '', webGoTo: '', appGoTo: '', order: 0, type: 'banner',
  campaignPeriod: { startDate: '', endDate: '' },
  visibility: { userTypes: 'both', devices: 'both' },
  metadata: { campaignName: '', category: '', tags: [], images: [] },
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
  <select
    name={name}
    value={value}
    onChange={onChange}
    className={`input bg-white ${className}`}
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
)

const BannerForm = ({ banner, onSubmit, onCancel }) => {
  const [form, setForm]         = useState(EMPTY)
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [advanced, setAdvanced] = useState(false)
  const [newTag, setNewTag]     = useState('')

  useEffect(() => {
    if (banner) {
      setForm({
        ...EMPTY, ...banner,
        campaignPeriod: banner.campaignPeriod || EMPTY.campaignPeriod,
        metadata: { ...EMPTY.metadata, ...(banner.metadata || {}) },
      })
    } else {
      setForm(EMPTY)
    }
  }, [banner])

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))
  const setNested = (root, key, val) => setForm(p => ({ ...p, [root]: { ...p[root], [key]: val } }))

  const handleChange = (e) => {
    const { name, value } = e.target
    set(name, value)
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }))
  }

  const handleImageFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { set('imageUrl', ev.target.result); setErrors(p => ({ ...p, imageUrl: null })) }
    reader.readAsDataURL(file)
  }

  const handleExtraImages = (e) => {
    Array.from(e.target.files || []).forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target.result) {
          setForm(p => ({ ...p, metadata: { ...p.metadata, images: [...p.metadata.images, ev.target.result] } }))
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeExtraImage = (idx) =>
    setForm(p => ({ ...p, metadata: { ...p.metadata, images: p.metadata.images.filter((_, i) => i !== idx) } }))

  const addTag = () => {
    const t = newTag.trim()
    if (t && !form.metadata.tags.includes(t)) {
      setNested('metadata', 'tags', [...form.metadata.tags, t])
      setNewTag('')
    }
  }

  const removeTag = (t) => setNested('metadata', 'tags', form.metadata.tags.filter(x => x !== t))

  const validate = () => {
    const e = {}
    if (!form.title.trim())    e.title    = 'El título es requerido'
    if (!form.imageUrl.trim()) e.imageUrl = 'La imagen principal es requerida'
    if (form.clickUrl.trim()) {
      try { new URL(form.clickUrl) } catch { e.clickUrl = 'URL inválida' }
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

        {/* Title */}
        <Field label="Título *" error={errors.title}>
          <input name="title" type="text" value={form.title} onChange={handleChange}
            className={inputCls('title')} placeholder="Ej: ¡Viajá con Carpuling este verano!" />
        </Field>

        {/* Image */}
        <Field label="Imagen principal *" error={errors.imageUrl}>
          <div className="flex gap-2">
            <label className="flex-1">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
              <div className={`input cursor-pointer flex items-center gap-2 text-slate-400 text-sm
                              ${errors.imageUrl ? 'border-red-400' : ''}`}>
                <span className="truncate">{form.imageUrl ? '✓ Imagen cargada' : 'Seleccionar imagen…'}</span>
              </div>
            </label>
            <button type="button" onClick={() => { set('imageUrl', getRandomPlaceholder('banner')); setErrors(p => ({...p, imageUrl: null})) }}
              className="btn btn-ghost border border-slate-200 px-3 text-xs text-slate-500 whitespace-nowrap">
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

        {/* Navigation */}
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

        {/* Button text */}
        <Field label="Texto del botón" hint="Opcional — si lo dejás vacío no se muestra el botón">
          <input name="buttonText" type="text" value={form.buttonText} onChange={handleChange}
            className="input" placeholder="Ej: Ver viajes, Reservar ahora…" />
        </Field>
      </div>

      {/* ── Advanced toggle ── */}
      <button type="button" onClick={() => setAdvanced(v => !v)}
        className="flex items-center justify-between w-full px-6 py-3 text-sm font-medium
                   text-slate-500 hover:text-slate-700 border-y border-slate-100
                   hover:bg-slate-50 transition-colors">
        <span>Opciones avanzadas</span>
        {advanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* ── Advanced section ── */}
      {advanced && (
        <div className="p-6 space-y-5 bg-slate-50/60">

          {/* Description + Type */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Descripción" className="col-span-2">
              <textarea name="description" value={form.description} onChange={handleChange}
                className="input h-auto py-2 resize-none" rows={2}
                placeholder="Descripción opcional del banner…" />
            </Field>
            <Field label="Tipo">
              <Select name="type" value={form.type} onChange={handleChange}
                options={[
                  { value: 'banner',        label: 'Banner' },
                  { value: 'advertisement', label: 'Anuncio' },
                  { value: 'promotional',   label: 'Promocional' },
                  { value: 'featured',      label: 'Destacado' },
                ]} />
            </Field>
            <Field label="Orden" hint="Ascendente">
              <input name="order" type="number" min="0" value={form.order} onChange={handleChange} className="input" />
            </Field>
          </div>

          {/* Click URL */}
          <Field label="URL externa (click)" error={errors.clickUrl} hint="Para links externos fuera de la app">
            <input name="clickUrl" type="url" value={form.clickUrl} onChange={handleChange}
              className={inputCls('clickUrl')} placeholder="https://…" />
          </Field>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Inicio campaña">
              <input type="date" name="startDate" value={form.campaignPeriod.startDate}
                onChange={e => setNested('campaignPeriod', 'startDate', e.target.value)} className="input" />
            </Field>
            <Field label="Fin campaña">
              <input type="date" name="endDate" value={form.campaignPeriod.endDate}
                onChange={e => setNested('campaignPeriod', 'endDate', e.target.value)} className="input" />
            </Field>
          </div>

          {/* Visibility */}
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

          {/* Campaign name + category */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre de campaña">
              <input type="text" value={form.metadata.campaignName}
                onChange={e => setNested('metadata', 'campaignName', e.target.value)}
                className="input" placeholder="Campaña verano 2025" />
            </Field>
            <Field label="Categoría">
              <input type="text" value={form.metadata.category}
                onChange={e => setNested('metadata', 'category', e.target.value)}
                className="input" placeholder="Marketing, Promo…" />
            </Field>
          </div>

          {/* Tags */}
          <Field label="Etiquetas">
            <div className="flex gap-2">
              <input type="text" className="input" value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                placeholder="Escribí y presioná Enter" />
              <button type="button" onClick={addTag}
                className="btn btn-secondary border border-slate-200 px-3 text-sm whitespace-nowrap">
                Agregar
              </button>
            </div>
            {form.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.metadata.tags.map(t => (
                  <span key={t} className="badge badge-blue gap-1 pr-1">
                    {t}
                    <button type="button" onClick={() => removeTag(t)}
                      className="hover:text-red-500 transition-colors ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          {/* Extra images */}
          <Field label="Imágenes adicionales del pack">
            <div className="flex gap-2">
              <label className="flex-1">
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleExtraImages} />
                <div className="input cursor-pointer text-slate-400 text-sm">Seleccionar imágenes…</div>
              </label>
              <button type="button"
                onClick={() => setForm(p => ({ ...p, metadata: { ...p.metadata, images: [...p.metadata.images, getRandomPlaceholder('banner')] } }))}
                className="btn btn-ghost border border-slate-200 px-3 text-xs text-slate-500 whitespace-nowrap">
                <RefreshCw className="w-3.5 h-3.5" /> Demo
              </button>
            </div>
            {form.metadata.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {form.metadata.images.map((img, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                    <img src={img} alt="" className="w-full h-full object-cover"
                      onError={e => { e.target.src = getSvgPlaceholder(120, 120) }} />
                    <button type="button" onClick={() => removeExtraImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Field>
        </div>
      )}

      {/* Error global */}
      {errors.submit && (
        <div className="mx-6 my-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {errors.submit}
        </div>
      )}

      {/* Actions */}
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
