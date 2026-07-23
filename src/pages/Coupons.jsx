import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import CouponForm from '../components/common/CouponForm'
import CouponList from '../components/common/CouponList'
import couponService from '../services/couponService'
import toast from 'react-hot-toast'

const Coupons = () => {
  const [coupons,        setCoupons]        = useState([])
  const [loading,        setLoading]        = useState(false)
  const [showForm,       setShowForm]       = useState(false)
  const [editingCoupon,  setEditingCoupon]  = useState(null)

  useEffect(() => { loadCoupons() }, [])

  const loadCoupons = async () => {
    setLoading(true)
    try {
      const res = await couponService.getAll()
      setCoupons(res.data || [])
    } catch (err) {
      toast.error('Error al cargar cupones: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    await couponService.create(formData)
    toast.success('Cupón creado')
    setShowForm(false)
    loadCoupons()
  }

  const handleUpdate = async (id, formData) => {
    await couponService.update(id, formData)
    toast.success('Cupón actualizado')
    setEditingCoupon(null)
    setShowForm(false)
    loadCoupons()
  }

  const handleToggle = async (id) => {
    await couponService.toggleStatus(id)
    loadCoupons()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cupón?')) return
    await couponService.remove(id)
    toast.success('Cupón eliminado')
    loadCoupons()
  }

  const openCreate = () => { setEditingCoupon(null); setShowForm(true) }
  const openEdit   = (c)  => { setEditingCoupon(c);  setShowForm(true) }
  const closeForm  = ()   => { setShowForm(false);   setEditingCoupon(null) }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cupones</h1>
          <p className="page-subtitle">Gestioná los cupones de descuento</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Nuevo cupón
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card p-16 flex flex-col items-center gap-3 text-slate-400">
          <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
          <span className="text-sm">Cargando…</span>
        </div>
      ) : (
        <CouponList coupons={coupons} onToggleStatus={handleToggle} onEdit={openEdit} onDelete={handleDelete} />
      )}

      {/* Modal crear/editar */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
             onClick={closeForm}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">
                {editingCoupon ? 'Editar cupón' : 'Nuevo cupón'}
              </h2>
              <button onClick={closeForm}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
                           hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <CouponForm
              coupon={editingCoupon}
              onSubmit={editingCoupon ? handleUpdate : handleCreate}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Coupons
