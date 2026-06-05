import { useState, useEffect } from 'react'
import { Plus, Eye, BarChart3, X } from 'lucide-react'
import BannerForm from '../components/common/BannerForm'
import BannerList from '../components/common/BannerList'
import BannerStats from '../components/common/BannerStats'
import bannerService from '../services/bannerService'
import toast from 'react-hot-toast'

const PACKAGES = [
  { id: 'free',       name: 'Free',       color: 'bg-slate-100 text-slate-600 hover:bg-slate-200' },
  { id: 'premium',    name: 'Premium',    color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
  { id: 'vip',        name: 'VIP',        color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
  { id: 'enterprise', name: 'Enterprise', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
]

const ACTIVE_PKG = {
  free:       'bg-slate-700 text-white',
  premium:    'bg-indigo-600 text-white',
  vip:        'bg-amber-500 text-white',
  enterprise: 'bg-emerald-600 text-white',
}

const Banners = () => {
  const [banners,        setBanners]        = useState([])
  const [selectedPkg,    setSelectedPkg]    = useState('free')
  const [loading,        setLoading]        = useState(false)
  const [showForm,       setShowForm]       = useState(false)
  const [editingBanner,  setEditingBanner]  = useState(null)
  const [stats,          setStats]          = useState(null)
  const [activeTab,      setActiveTab]      = useState('list')

  useEffect(() => { loadBanners() }, [selectedPkg])
  useEffect(() => { if (activeTab === 'stats') loadStats() }, [selectedPkg, activeTab])

  const loadBanners = async () => {
    setLoading(true)
    try {
      const res = await bannerService.getBannersByPackage(selectedPkg)
      setBanners(res.data || [])
    } catch (err) {
      toast.error('Error al cargar banners: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const res = await bannerService.getBannerStats(selectedPkg)
      setStats(res.data)
    } catch { /* silent */ }
  }

  const handleCreate = async (formData) => {
    await bannerService.createBanner({ ...formData, packageId: selectedPkg })
    toast.success('Banner creado')
    setShowForm(false)
    loadBanners()
  }

  const handleUpdate = async (id, formData) => {
    await bannerService.updateBanner(id, formData)
    toast.success('Banner actualizado')
    setEditingBanner(null)
    setShowForm(false)
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
    loadBanners()
  }

  const handleReorder = async (reordered) => {
    await bannerService.reorderBanners(selectedPkg, reordered.map(b => ({ id: b._id, order: b.order })))
    loadBanners()
  }

  const openCreate = () => { setEditingBanner(null); setShowForm(true) }
  const openEdit   = (b)  => { setEditingBanner(b);  setShowForm(true) }
  const closeForm  = ()   => { setShowForm(false);   setEditingBanner(null) }

  const pkgLabel = PACKAGES.find(p => p.id === selectedPkg)?.name

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Banners</h1>
          <p className="page-subtitle">Gestioná los banners por paquete de publicidad</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Nuevo banner
        </button>
      </div>

      {/* Package selector */}
      <div className="flex gap-2 flex-wrap">
        {PACKAGES.map(pkg => (
          <button key={pkg.id}
            onClick={() => setSelectedPkg(pkg.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
                        ${selectedPkg === pkg.id ? ACTIVE_PKG[pkg.id] : pkg.color}`}>
            {pkg.name}
            {selectedPkg === pkg.id && (
              <span className="ml-1.5 opacity-75 text-xs">
                {banners.length} {banners.length === 1 ? 'banner' : 'banners'}
              </span>
            )}
          </button>
        ))}
      </div>

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
              <p className="font-medium text-slate-600">Sin banners en {pkgLabel}</p>
              <p className="text-sm mt-1">Creá el primer banner para este paquete</p>
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

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
             onClick={closeForm}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
               onClick={e => e.stopPropagation()}>
            {/* Modal header */}
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
