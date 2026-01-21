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

        {/* URLs */}
        <div className="form-section">
          <h3>🔗 URLs</h3>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label required">URL de la Imagen</label>
              <button
                type="button"
                onClick={handleGeneratePlaceholder}
                style={{
                  padding: '6px 12px',
                  background: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} /> Generar imagen
              </button>
            </div>
            <input
              type="url"
              className={`form-input ${errors.imageUrl ? 'error' : ''}`}
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://ejemplo.com/imagen.jpg"
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
            
            {/* Inputs para agregar nuevas imágenes */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="url"
                className="form-input"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                placeholder="URL de imagen adicional"
              />
              <button
                type="button"
                onClick={handleAddImage}
                disabled={!newImageUrl.trim() || !isValidUrl(newImageUrl)}
                style={{
                  padding: '10px 16px',
                  background: '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  opacity: (!newImageUrl.trim() || !isValidUrl(newImageUrl)) ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={16} /> Agregar
              </button>
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

            {/* Lista de URLs de imágenes editables */}
            {formData.metadata.images.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>
                  {formData.metadata.images.length} imagen(es) del pack:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {formData.metadata.images.map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'stretch',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef'
                      }}
                    >
                      {/* Miniatura */}
                      <div
                        style={{
                          width: '80px',
                          minWidth: '80px',
                          height: '80px',
                          overflow: 'hidden',
                          borderRadius: '4px',
                          backgroundColor: '#fff',
                          border: '1px solid #dee2e6'
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
                            e.target.src = getSvgPlaceholder(80, 80);
                          }}
                        />
                      </div>

                      {/* URL Input */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="url"
                          className="form-input"
                          value={img}
                          onChange={(e) => {
                            const newImages = [...formData.metadata.images];
                            newImages[idx] = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                images: newImages
                              }
                            }));
                          }}
                          style={{
                            flex: 1,
                            fontFamily: 'monospace',
                            fontSize: '12px'
                          }}
                          placeholder="URL de la imagen"
                        />
                        <span style={{ fontSize: '11px', color: '#666' }}>
                          Imagen {idx + 1} de {formData.metadata.images.length}
                        </span>
                      </div>

                      {/* Botón eliminar */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        style={{
                          padding: '8px 12px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Trash2 size={16} /> Eliminar
                      </button>
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
