import React, { useState, useEffect } from 'react';
import { Save, X, RefreshCw, Trash2, Plus } from 'lucide-react';
import { getRandomPlaceholder, getSvgPlaceholder } from '../../constants/placeholders';
import '../../styles/components/BannerForm.css';

const BannerForm = ({ banner, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    clickUrl: '',
    order: 0,
    type: 'banner',
    campaignPeriod: { startDate: '', endDate: '' },
    visibility: {
      userTypes: 'both',
      devices: 'both'
    },
    metadata: {
      campaignName: '',
      category: '',
      tags: [],
      images: [] // Array de imágenes adicionales
    }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (banner) {
      setFormData({
        ...banner,
        campaignPeriod: banner.campaignPeriod || { startDate: '', endDate: '' },
        metadata: banner.metadata || { campaignName: '', category: '', tags: [], images: [] }
      });
    }
  }, [banner]);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        setFormData(prev => ({
          ...prev,
          imageUrl: base64
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImageFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        if (base64) {
          setFormData(prev => ({
            ...prev,
            metadata: {
              ...prev.metadata,
              images: [...prev.metadata.images, base64]
            }
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUrlDirectly = (imageData) => {
    if (imageData && !formData.metadata.images.includes(imageData)) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          images: [...prev.metadata.images, imageData]
        }
      }));
    }
  };

  const handleGenerateAdditionalImage = () => {
    const placeholder = getRandomPlaceholder('banner');
    handleImageUrlDirectly(placeholder);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'La URL de la imagen principal es requerida';
    } else if (!isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'La URL de la imagen no es válida';
    }

    if (formData.clickUrl.trim() && !isValidUrl(formData.clickUrl)) {
      newErrors.clickUrl = 'La URL de destino no es válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      campaignPeriod: {
        ...prev.campaignPeriod,
        [name]: value
      }
    }));
  };

  const handleVisibilityChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [field]: value
      }
    }));
  };

  const handleMetadataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.metadata.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          tags: [...prev.metadata.tags, newTag.trim()]
        }
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: prev.metadata.tags.filter(tag => tag !== tagToRemove)
      }
    }));
  };

  const handleAddImage = () => {
    if (newImageUrl.trim() && isValidUrl(newImageUrl)) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          images: [...prev.metadata.images, newImageUrl.trim()]
        }
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        images: prev.metadata.images.filter((_, i) => i !== index)
      }
    }));
  };

  const handleGeneratePlaceholder = () => {
    const placeholder = getRandomPlaceholder('banner');
    setFormData(prev => ({
      ...prev,
      imageUrl: placeholder
    }));
  };

  const handleGenerateAdditionalImage = () => {
    const placeholder = getRandomPlaceholder('banner');
    if (!formData.metadata.images.includes(placeholder)) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          images: [...prev.metadata.images, placeholder]
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (banner && banner._id) {
        await onSubmit(banner._id, formData);
      } else {
        await onSubmit(formData);
      }
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="banner-form-container" onSubmit={handleSubmit}>
      <div className="form-content">
        {/* Información Básica */}
        <div className="form-section">
          <h3>📝 Información Básica</h3>

          <div className="form-group">
            <label className="form-label required">Título del Banner</label>
            <input
              type="text"
              className={`form-input ${errors.title ? 'error' : ''}`}
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ej: Únete a nuestra comunidad"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-textarea"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descripción opcional del banner..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Banner</label>
            <select
              className="form-select"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
            >
              <option value="banner">Banner</option>
              <option value="advertisement">Anuncio</option>
              <option value="promotional">Promocional</option>
              <option value="featured">Destacado</option>
            </select>
          </div>
        </div>

        {/* Imágenes */}
        <div className="form-section">
          <h3>🖼️ Imágenes</h3>

          <div className="form-group">
            <label className="form-label required">Imagen Principal</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                width: '100%',
                cursor: 'pointer'
              }}
            />
            {errors.imageUrl && <span className="error-message">{errors.imageUrl}</span>}

            {formData.imageUrl && (
              <div className="image-preview">
                <img
                  src={formData.imageUrl}
                  alt="Vista previa"
                  onError={(e) => {
                    e.target.src = getSvgPlaceholder(400, 150);
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">URL de Destino (Click)</label>
            <input
              type="url"
              className={`form-input ${errors.clickUrl ? 'error' : ''}`}
              name="clickUrl"
              value={formData.clickUrl}
              onChange={handleInputChange}
              placeholder="https://ejemplo.com"
            />
            {errors.clickUrl && <span className="error-message">{errors.clickUrl}</span>}
          </div>

          {/* Imágenes Adicionales */}
          <div className="form-group">
            <label className="form-label">Imágenes Adicionales del Pack</label>
            
            {/* Input para cargar múltiples archivos */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalImageFileChange}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  flex: 1,
                  cursor: 'pointer'
                }}
              />
              <button
                type="button"
                onClick={handleGenerateAdditionalImage}
                style={{
                  padding: '10px 16px',
                  background: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={16} /> Generar
              </button>
            </div>

            {/* Lista de imágenes cargadas */}
            {formData.metadata.images.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>
                  {formData.metadata.images.length} imagen(es) del pack:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                  {formData.metadata.images.map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        border: '1px solid #dee2e6',
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <img
                        src={img}
                        alt={`Imagen ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.src = getSvgPlaceholder(120, 120);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(220, 53, 69, 0.95)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          padding: 0,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                      >
                        ×
                      </button>
                      <div style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        background: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        padding: '4px',
                        fontSize: '11px',
                        textAlign: 'center'
                      }}>
                        {idx + 1}/{formData.metadata.images.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Período de Campaña */}
        <div className="form-section">
          <h3>📅 Período de Campaña</h3>

          <div className="date-picker-group">
            <div className="form-group">
              <label className="form-label">Fecha de Inicio</label>
              <input
                type="date"
                className="form-input"
                name="startDate"
                value={formData.campaignPeriod.startDate}
                onChange={handleDateChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de Fin</label>
              <input
                type="date"
                className="form-input"
                name="endDate"
                value={formData.campaignPeriod.endDate}
                onChange={handleDateChange}
              />
            </div>
          </div>
        </div>

        {/* Visibilidad */}
        <div className="form-section">
          <h3>👁️ Visibilidad</h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tipo de Usuario</label>
              <select
                className="form-select"
                value={formData.visibility.userTypes}
                onChange={(e) => handleVisibilityChange('userTypes', e.target.value)}
              >
                <option value="both">Ambos (Conductor y Pasajero)</option>
                <option value="driver">Solo Conductores</option>
                <option value="passenger">Solo Pasajeros</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Dispositivos</label>
              <select
                className="form-select"
                value={formData.visibility.devices}
                onChange={(e) => handleVisibilityChange('devices', e.target.value)}
              >
                <option value="both">Ambos (Móvil y Web)</option>
                <option value="mobile">Solo Móvil</option>
                <option value="web">Solo Web</option>
              </select>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="form-section">
          <h3>🏷️ Información Adicional</h3>

          <div className="form-group">
            <label className="form-label">Nombre de Campaña</label>
            <input
              type="text"
              className="form-input"
              name="campaignName"
              value={formData.metadata.campaignName}
              onChange={(e) => handleMetadataChange('campaignName', e.target.value)}
              placeholder="Ej: Campaña de Invierno 2024"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Categoría</label>
            <input
              type="text"
              className="form-input"
              name="category"
              value={formData.metadata.category}
              onChange={(e) => handleMetadataChange('category', e.target.value)}
              placeholder="Ej: Marketing, Promoción, Premium"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Etiquetas</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                className="form-input"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Escribe y presiona Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                style={{
                  padding: '10px 16px',
                  background: '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Agregar
              </button>
            </div>

            {formData.metadata.tags.length > 0 && (
              <div className="tag-input" style={{ cursor: 'default', padding: '12px' }}>
                {formData.metadata.tags.map(tag => (
                  <div key={tag} className="tag">
                    {tag}
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Orden</label>
            <input
              type="number"
              className="form-input"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              min="0"
            />
            <p style={{ fontSize: '12px', color: '#999', margin: '6px 0 0 0' }}>
              Los banners se mostrarán en orden ascendente
            </p>
          </div>
        </div>

        {errors.submit && (
          <div className="alert error" style={{ margin: '16px 0' }}>
            {errors.submit}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="form-actions">
        <button
          type="button"
          className="form-btn cancel"
          onClick={onCancel}
          disabled={loading}
        >
          <X size={18} /> Cancelar
        </button>
        <button
          type="submit"
          className="form-btn submit"
          disabled={loading}
        >
          <Save size={18} /> {loading ? 'Guardando...' : banner ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default BannerForm;
