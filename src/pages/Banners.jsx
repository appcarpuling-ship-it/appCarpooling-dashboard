import { useState, useEffect } from 'react'
import { Plus, Eye, BarChart3, X, Tag } from 'lucide-react'
import BannerForm from '../components/common/BannerForm'
import BannerList from '../components/common/BannerList'
import BannerStats from '../components/common/BannerStats'
import bannerService from '../services/bannerService'
import toast from 'react-hot-toast'

const Banners = () => {
  const [banners,          setBanners]          = useState([])
  const [sections,         setSections]         = useState([])   // [{sectionTitle, banners}]
  const [selectedSection,  setSelectedSection]  = useState('')
  const [newSectionInput,  setNewSectionInput]  = useState('')
  const [loading,          setLoading]          = useState(false)
  const [showForm,         setShowForm]         = useState(false)
  const [editingBanner,    setEditingBanner]    = useState(null)
  const [stats,            setStats]            = useState(null)
  const [activeTab,        setActiveTab]        = useState('list')

  useEffect(() => { loadSections() }, [])
  useEffect(() => { if (selectedSection) loadBanners() }, [selectedSection])
  useEffect(() => { if (activeTab === 'stats' && selectedSection) loadStats() }, [selectedSection, activeTab])

  const loadSections = async () => {
    try {
      const res = await bannerService.getAllSections()
      const list = res.data || []
      setSections(list)
      if (list.length > 0 && !selectedSection) {
        setSelectedSection(list[0].sectionTitle)
      }
    } catch (err) {
      toast.error('Error al cargar secciones: ' + err.message)
    }
  }

  const loadBanners = async () => {
    setLoading(true)
    try {
      const res = await bannerService.getBannersBySection(selectedSection)
      setBanners(res.data || [])
    } catch (err) {
      toast.error('Error al cargar banners: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const res = await bannerService.getBannerStats(selectedSection)
      setStats(res.data)
    } catch { /* silent */ }
  }

  const handleCreate = async (formData) => {
    await bannerService.createBanner({ ...formData, sectionTitle: formData.sectionTitle || selectedSection })
    toast.success('Banner creado')
    setShowForm(false)
    await loadSections()
    loadBanners()
  }

  const handleUpdate = async (id, formData) => {
    await bannerService.updateBanner(id, formData)
    toast.success('Banner actualizado')
    setEditingBanner(null)
    setShowForm(false)
    await loadSections()
    loadBanners()
  }

  const handleToggle = async (id) => {
    await bannerService.toggleBannerStatus(id)
    loadBanners()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este banner?')) return
    await bannerService.deleteBanner(id)
    toast.success('Banner eliminado')
    await loadSections()
    loadBanners()
  }

  const handleReorder = async (reordered) => {
    await bannerService.reorderBanners(selectedSection, reordered.map(b => ({ id: b._id, order: b.order })))
    loadBanners()
  }

  const openCreate = () => { setEditingBanner(null); setShowForm(true) }
  const openEdit   = (b)  => { setEditingBanner(b);  setShowForm(true) }
  const closeForm  = ()   => { setShowForm(false);   setEditingBanner(null) }

  // Agregar nueva sección desde el input
  const handleAddSection = () => {
    const name = newSectionInput.trim()
    if (!name) return
    if (sections.some(s => s.sectionTitle === name)) {
      setSelectedSection(name)
      setNewSectionInput('')
      return
    }
    // Sección nueva: se creará en BD cuando se cree el primer banner
    setSections(prev => [...prev, { sectionTitle: name, banners: [] }])
    setSelectedSection(name)
    setBanners([])
    setNewSectionInput('')
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Banners</h1>
          <p className="page-subtitle">Gestioná los banners por sección</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Nuevo banner
        </button>
      </div>

      {/* Section selector */}
      <div className="card p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Secciones</p>
        <div className="flex gap-2 flex-wrap">
          {sections.map(s => (
            <button key={s.sectionTitle}
              onClick={() => setSelectedSection(s.sectionTitle)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                          ${selectedSection === s.sectionTitle
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <Tag className="w-3 h-3" />
              {s.sectionTitle}
              {selectedSection === s.sectionTitle && (
                <span className="ml-0.5 opacity-75 text-xs">
                  {banners.length} {banners.length === 1 ? 'banner' : 'banners'}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Agregar nueva sección */}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={newSectionInput}
            onChange={e => setNewSectionInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddSection() }}
            className="input flex-1 text-sm"
            placeholder="Nueva sección (ej: Ofertas, Inicio, Novedades…)" />
          <button onClick={handleAddSection} className="btn btn-secondary border border-slate-200 px-4 text-sm whitespace-nowrap">
            Agregar
          </button>
        </div>
      </div>

      {/* No hay sección seleccionada */}
      {!selectedSection ? (
        <div className="card p-16 flex flex-col items-center gap-3 text-slate-400">
          <Tag className="w-10 h-10 text-slate-300" />
          <p className="text-sm">Creá o seleccioná una sección para ver sus banners</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="card p-1 flex gap-1 w-fit">
            {[
              { id: 'list',  label: 'Banners activos', icon: Eye },
              { id: 'stats', label: 'Estadísticas',    icon: BarChart3 },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                            ${activeTab === id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="card p-16 flex flex-col items-center gap-3 text-slate-400">
              <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
              <span className="text-sm">Cargando…</span>
            </div>
          ) : activeTab === 'list' ? (
            banners.length === 0 ? (
              <div className="card p-16 flex flex-col items-center gap-3 text-slate-400">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-slate-300" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-600">Sin banners en "{selectedSection}"</p>
                  <p className="text-sm mt-1">Creá el primer banner para esta sección</p>
                </div>
                <button onClick={openCreate} className="btn btn-primary mt-1">
                  <Plus className="w-4 h-4" /> Crear banner
                </button>
              </div>
            ) : (
              <BannerList banners={banners} onToggleStatus={handleToggle}
                onEdit={openEdit} onDelete={handleDelete} onReorder={handleReorder} />
            )
          ) : (
            <BannerStats stats={stats} banners={banners} />
          )}
        </>
      )}

      {/* Modal crear/editar */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
             onClick={closeForm}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">
                {editingBanner ? 'Editar banner' : 'Nuevo banner'}
              </h2>
              <button onClick={closeForm}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
                           hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <BannerForm
              banner={editingBanner}
              currentSection={selectedSection}
              sections={sections.map(s => s.sectionTitle)}
              onSubmit={editingBanner ? handleUpdate : handleCreate}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Banners
