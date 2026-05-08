import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Newspaper } from 'lucide-react'
import { Card, Button, Input, Loading, Modal } from '../components/common'
import newsService from '../services/newsService'
import toast from 'react-hot-toast'

const NewsPage = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await newsService.list()
      setItems(res.data || [])
    } catch (e) {
      toast.error('No se pudieron cargar las noticias')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const resetForm = () => {
    setTitle('')
    setBody('')
    setImageUrl('')
    setEditing(null)
  }

  const openNew = () => {
    resetForm()
    setShowForm(true)
  }

  const openEdit = (n) => {
    setEditing(n)
    setTitle(n.title || '')
    setBody(n.body || '')
    setImageUrl(n.imageUrl || '')
    setShowForm(true)
  }

  const handleImageFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Seleccioná una imagen')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setImageUrl(reader.result)
    reader.readAsDataURL(file)
  }

  const save = async () => {
    if (!title.trim() || !body.trim() || !imageUrl.trim()) {
      toast.error('Completá título, texto e imagen')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await newsService.update(editing._id, { title, body, imageUrl })
        toast.success('Noticia actualizada')
      } else {
        await newsService.create({ title, body, imageUrl, isActive: true })
        toast.success('Noticia creada')
      }
      setShowForm(false)
      resetForm()
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const onToggle = async (n) => {
    try {
      await newsService.toggle(n._id)
      toast.success('Estado actualizado')
      load()
    } catch {
      toast.error('No se pudo cambiar el estado')
    }
  }

  const onDelete = async (n) => {
    if (!window.confirm('¿Eliminar esta noticia y sus lecturas?')) return
    try {
      await newsService.remove(n._id)
      toast.success('Eliminada')
      load()
    } catch {
      toast.error('No se pudo eliminar')
    }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper className="w-7 h-7" />
            Noticias
          </h1>
          <p className="text-gray-600 mt-1">
            Imagen + texto. En la app se muestran como modal (una vez por usuario) hasta que cierre el aviso.
          </p>
        </div>
        <Button onClick={openNew} className="inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva noticia
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No hay noticias todavía.</p>
          ) : (
            items.map((n) => (
              <div key={n._id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                {n.imageUrl && (
                  <img
                    src={n.imageUrl}
                    alt=""
                    className="w-full sm:w-28 h-20 object-cover rounded-lg border border-gray-100"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{n.title}</p>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {n.isActive ? 'Activa' : 'Inactiva'} · {new Date(n.createdAt).toLocaleString('es-AR')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => onToggle(n)} title={n.isActive ? 'Desactivar' : 'Activar'}>
                    {n.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(n)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(n)} className="text-red-600 border-red-200">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); resetForm() }} title={editing ? 'Editar noticia' : 'Nueva noticia'} size="2xl">
        <div className="space-y-4 p-1">
          <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título breve" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texto completo</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[140px]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Contenido que verá el usuario..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
            <input type="file" accept="image/*" onChange={handleImageFile} className="text-sm" />
            {imageUrl && (
              <img src={imageUrl} alt="" className="mt-3 max-h-40 rounded-lg border border-gray-100" />
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm() }}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default NewsPage
