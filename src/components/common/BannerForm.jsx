import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import '../../styles/components/BannerForm.css';

const BannerForm = ({ banner, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    clickUrl: '',
    order: 0,
    type: 'banner',
    dimensions: { width: 1080, height: 300 },
    campaignPeriod: { startDate: '', endDate: '' },
    visibility: {
      userTypes: 'both',
      devices: 'both'
    },
    metadata: {
      campaignName: '',
      category: '',
      tags: []
    }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (banner) {
      setFormData({
        ...banner,
        dimensions: banner.dimensions || { width: 1080, height: 300 },
        campaignPeriod: banner.campaignPeriod || { startDate: '', endDate: '' },
        metadata: banner.metadata || { campaignName: '', category: '', tags: [] }
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
      newErrors.imageUrl = 'La URL de la imagen es requerida';
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

  const handleDimensionsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [name]: parseInt(value) || 0
      }
    }));
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
            <label className="form-label required">URL de la Imagen</label>
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
                    e.target.src = 'https://via.placeholder.com/400x150?text=Error';
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
        </div>

        {/* Dimensiones */}
        <div className="form-section">
          <h3>📐 Dimensiones</h3>

          <div className="dimensions-grid">
            <div className="form-group">
              <label className="form-label">Ancho (px)</label>
              <input
                type="number"
                className="form-input"
                name="width"
                value={formData.dimensions.width}
                onChange={handleDimensionsChange}
                min="100"
                max="2000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Altura (px)</label>
              <input
                type="number"
                className="form-input"
                name="height"
                value={formData.dimensions.height}
                onChange={handleDimensionsChange}
                min="50"
                max="2000"
              />
            </div>
          </div>

          <p style={{ fontSize: '12px', color: '#999', margin: '12px 0 0 0' }}>
            Dimensiones: {formData.dimensions.width}px × {formData.dimensions.height}px
          </p>
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

  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [name]: value
      }
    }));
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'La URL de imagen es requerida';
    } else if (!isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'URL de imagen inválida';
    }

    if (formData.clickUrl && !isValidUrl(formData.clickUrl)) {
      newErrors.clickUrl = 'URL de clic inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (banner) {
        onSubmit(banner._id, formData);
      } else {
        onSubmit(formData);
      }
    }
  };

  return (
    <div className="banner-form-container">
      <div className="banner-form">
        <div className="form-header">
          <h2>{banner ? '✏️ Editar Banner' : '➕ Crear Nuevo Banner'}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Información básica */}
          <div className="form-section">
            <h3>Información Básica</h3>

            <div className="form-group">
              <label>Título *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ej: Descuento 50% en viajes"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-msg">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descripción del banner"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tipo</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="banner">Banner</option>
                  <option value="advertisement">Publicidad</option>
                  <option value="promotional">Promocional</option>
                  <option value="featured">Destacado</option>
                </select>
              </div>

              <div className="form-group">
                <label>Orden</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* URLs */}
          <div className="form-section">
            <h3>URLs</h3>

            <div className="form-group">
              <label>URL de Imagen *</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/imagen.jpg"
                className={errors.imageUrl ? 'error' : ''}
              />
              {errors.imageUrl && <span className="error-msg">{errors.imageUrl}</span>}
              {formData.imageUrl && (
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="image-preview"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/1080x300?text=Error+Loading';
                  }}
                />
              )}
            </div>

            <div className="form-group">
              <label>URL de Clic (opcional)</label>
              <input
                type="url"
                name="clickUrl"
                value={formData.clickUrl}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com"
                className={errors.clickUrl ? 'error' : ''}
              />
              {errors.clickUrl && <span className="error-msg">{errors.clickUrl}</span>}
            </div>
          </div>

          {/* Dimensiones */}
          <div className="form-section">
            <h3>Dimensiones</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Ancho (px)</label>
                <input
                  type="number"
                  name="width"
                  value={formData.dimensions.width}
                  onChange={handleDimensionsChange}
                  min="100"
                />
              </div>

              <div className="form-group">
                <label>Alto (px)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.dimensions.height}
                  onChange={handleDimensionsChange}
                  min="100"
                />
              </div>
            </div>
          </div>

          {/* Período de campaña */}
          <div className="form-section">
            <h3>Período de Campaña (opcional)</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha de Inicio</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.campaignPeriod.startDate}
                  onChange={handleDateChange}
                />
              </div>

              <div className="form-group">
                <label>Fecha de Fin</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.campaignPeriod.endDate}
                  onChange={handleDateChange}
                />
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="form-section">
            <h3>Información Adicional</h3>

            <div className="form-group">
              <label>Nombre de Campaña</label>
              <input
                type="text"
                name="campaignName"
                value={formData.metadata.campaignName}
                onChange={handleMetadataChange}
                placeholder="Ej: Summer Campaign 2026"
              />
            </div>

            <div className="form-group">
              <label>Categoría</label>
              <input
                type="text"
                name="category"
                value={formData.metadata.category}
                onChange={handleMetadataChange}
                placeholder="Ej: upgrade, referral, promotion"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              <FaTimes /> Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <FaSave /> {banner ? 'Actualizar' : 'Crear'} Banner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerForm;
