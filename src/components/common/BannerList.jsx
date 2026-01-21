import React, { useState } from 'react';
import { Edit, Trash2, ToggleRight, ToggleLeft, GripVertical } from 'lucide-react';
import { getSvgPlaceholder } from '../../constants/placeholders';
import '../../styles/components/BannerList.css';

const BannerList = ({ banners, onToggleStatus, onEdit, onDelete, onReorder }) => {
  const [draggedBanner, setDraggedBanner] = useState(null);
  const [reorderedBanners, setReorderedBanners] = useState(banners);

  const handleDragStart = (e, banner) => {
    setDraggedBanner(banner);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropBanner = (e, targetBanner) => {
    e.preventDefault();

    if (!draggedBanner || draggedBanner._id === targetBanner._id) {
      setDraggedBanner(null);
      return;
    }

    const draggedIndex = reorderedBanners.findIndex(b => b._id === draggedBanner._id);
    const targetIndex = reorderedBanners.findIndex(b => b._id === targetBanner._id);

    const newBanners = [...reorderedBanners];
    newBanners.splice(draggedIndex, 1);
    newBanners.splice(targetIndex, 0, draggedBanner);

    // Actualizar órdenes
    const updatedBanners = newBanners.map((banner, idx) => ({
      ...banner,
      order: idx
    }));

    setReorderedBanners(updatedBanners);
    onReorder(updatedBanners);
    setDraggedBanner(null);
  };

  return (
    <div className="banner-list-container">
      <div className="banner-list-header">
        <p className="info-text">
          📌 Arrastra los banners para reordenar. El orden afecta la visualización.
        </p>
      </div>

      <div className="banner-list">
        {reorderedBanners.map((banner, index) => (
          <div
            key={banner._id}
            className={`banner-item ${!banner.isActive ? 'inactive' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, banner)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropBanner(e, banner)}
          >
            {/* Icono de drag */}
            <div className="banner-drag-handle">
              <GripVertical size={18} />
            </div>

            {/* Imagen del banner */}
            <div className="banner-image">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                onError={(e) => {
                  e.target.src = getSvgPlaceholder(150, 80);
                }}
              />
              <span className="order-badge">{index + 1}</span>
            </div>

            {/* Información del banner */}
            <div className="banner-info">
              <h3>{banner.title}</h3>
              {banner.description && <p>{banner.description}</p>}

              <div className="banner-meta">
                <span className={`type-badge ${banner.type}`}>{banner.type}</span>
                <span className="stats">
                  👁️ {banner.statistics?.views || 0} vistas •
                  🖱️ {banner.statistics?.clicks || 0} clics
                </span>
              </div>
            </div>

            {/* Acciones */}
            <div className="banner-actions">
              <button
                className={`action-btn toggle ${banner.isActive ? 'active' : 'inactive'}`}
                onClick={() => onToggleStatus(banner._id)}
                title={banner.isActive ? 'Desactivar' : 'Activar'}
              >
                {banner.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              </button>

              <button
                className="action-btn edit"
                onClick={() => onEdit(banner)}
                title="Editar"
              >
                <Edit size={18} />
              </button>

              <button
                className="action-btn delete"
                onClick={() => onDelete(banner._id)}
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Estado visual */}
            <div className={`banner-status ${banner.isActive ? 'active' : 'inactive'}`}>
              {banner.isActive ? '✓ Activo' : '✗ Inactivo'}
            </div>
          </div>
        ))}
      </div>

      {reorderedBanners.length === 0 && (
        <div className="empty-state">
          <p>No hay banners para mostrar</p>
        </div>
      )}
    </div>
  );
};

export default BannerList;
