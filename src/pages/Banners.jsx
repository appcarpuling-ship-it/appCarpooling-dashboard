import React, { useState, useEffect } from 'react';
import { Plus, Eye, BarChart3 } from 'lucide-react';
import BannerForm from '../components/common/BannerForm';
import BannerList from '../components/common/BannerList';
import BannerStats from '../components/common/BannerStats';
import bannerService from '../services/bannerService';
import '../styles/pages/Banners.css';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState('free');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // 'list' o 'stats'
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const packages = [
    { id: 'free', name: 'Free', color: '#6c757d' },
    { id: 'premium', name: 'Premium', color: '#007bff' },
    { id: 'vip', name: 'VIP', color: '#ffc107' },
    { id: 'enterprise', name: 'Enterprise', color: '#28a745' }
  ];

  // Cargar banners cuando cambia el paquete
  useEffect(() => {
    loadBanners();
  }, [selectedPackage]);

  // Cargar estadísticas
  useEffect(() => {
    if (activeTab === 'stats') {
      loadStats();
    }
  }, [selectedPackage, activeTab]);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const response = await bannerService.getBannersByPackage(selectedPackage);
      setBanners(response.data || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar banners: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await bannerService.getBannerStats(selectedPackage);
      setStats(response.data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const handleCreateBanner = async (formData) => {
    try {
      const bannerData = {
        ...formData,
        packageId: selectedPackage
      };

      await bannerService.createBanner(bannerData);
      setSuccess('Banner creado exitosamente');
      setShowForm(false);
      loadBanners();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al crear banner: ' + err.message);
    }
  };

  const handleUpdateBanner = async (id, formData) => {
    try {
      await bannerService.updateBanner(id, formData);
      setSuccess('Banner actualizado exitosamente');
      setEditingBanner(null);
      setShowForm(false);
      loadBanners();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al actualizar banner: ' + err.message);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await bannerService.toggleBannerStatus(id);
      setSuccess('Estado del banner actualizado');
      loadBanners();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al cambiar estado: ' + err.message);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este banner?')) {
      try {
        await bannerService.deleteBanner(id);
        setSuccess('Banner eliminado exitosamente');
        loadBanners();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError('Error al eliminar banner: ' + err.message);
      }
    }
  };

  const handleReorder = async (reorderedBanners) => {
    try {
      const reorderData = reorderedBanners.map(banner => ({
        id: banner._id,
        order: banner.order
      }));

      await bannerService.reorderBanners(selectedPackage, reorderData);
      setSuccess('Banners reordenados exitosamente');
      loadBanners();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al reordenar: ' + err.message);
    }
  };

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBanner(null);
  };

  const currentPackage = packages.find(p => p.id === selectedPackage);

  return (
    <div className="banners-page">
      {/* Header */}
      <div className="banners-header">
        <h1>🎨 Gestión de Banners</h1>
        <button
          className="create-banner-btn"
          onClick={() => {
            setEditingBanner(null);
            setShowForm(true);
          }}
        >
          <Plus size={18} /> Crear Banner
        </button>
      </div>

      {/* Mensajes de éxito/error */}
      {error && (
        <div className="alert error">
          {error}
          <button className="alert-close" onClick={() => setError(null)}>×</button>
        </div>
      )}
      {success && (
        <div className="alert success">
          {success}
          <button className="alert-close" onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      {/* Selector de paquete */}
      <div className="package-selector">
        {packages.map(pkg => (
          <button
            key={pkg.id}
            className={`package-btn ${pkg.id} ${selectedPackage === pkg.id ? 'active' : ''}`}
            onClick={() => setSelectedPackage(pkg.id)}
          >
            <span>{pkg.name}</span>
            <span className="package-count">{banners.length} banner{banners.length !== 1 ? 's' : ''}</span>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <Eye size={18} /> Banners Activos
        </button>
        <button
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart3 size={18} /> Estadísticas
        </button>
      </div>

      {/* Contenido de tabs */}
      <div className="tab-content">
        {activeTab === 'list' ? (
          <>
            {loading && (
              <div className="loading-state">
                <div className="spinner" />
                Cargando banners...
              </div>
            )}

            {!loading && banners.length === 0 && (
              <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: '16px', color: '#999' }}>
                  📭 No hay banners en el paquete <strong>{currentPackage?.name}</strong>
                </p>
                <p style={{ fontSize: '13px', color: '#bbb', marginTop: '10px' }}>
                  Crea tu primer banner para comenzar
                </p>
              </div>
            )}

            {!loading && banners.length > 0 && (
              <BannerList
                banners={banners}
                onToggleStatus={handleToggleStatus}
                onEdit={handleEditBanner}
                onDelete={handleDeleteBanner}
                onReorder={handleReorder}
              />
            )}
          </>
        ) : (
          <>
            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                Cargando estadísticas...
              </div>
            ) : (
              <BannerStats stats={stats} banners={banners} />
            )}
          </>
        )}
      </div>

      {/* Modal del formulario */}
      {showForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h2>{editingBanner ? '✏️ Editar Banner' : '✨ Crear Banner'}</h2>
              <button className="form-close-btn" onClick={handleCloseForm}>×</button>
            </div>
            <BannerForm
              banner={editingBanner}
              onSubmit={editingBanner ? handleUpdateBanner : handleCreateBanner}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
