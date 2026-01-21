import React from 'react';
import { Eye, MousePointer, BarChart3, Percent } from 'lucide-react';
import '../../styles/components/BannerStats.css';

const BannerStats = ({ stats, banners }) => {
  // Calcular estadísticas generales
  const totalBanners = banners.length;
  const activeBanners = banners.filter(b => b.isActive).length;
  const totalViews = banners.reduce((sum, b) => sum + (b.statistics?.views || 0), 0);
  const totalClicks = banners.reduce((sum, b) => sum + (b.statistics?.clicks || 0), 0);
  const totalImpressions = banners.reduce((sum, b) => sum + (b.statistics?.impressions || 0), 0);

  // Calcular CTR promedio
  const averageCTR =
    totalImpressions > 0
      ? ((totalClicks / totalImpressions) * 100).toFixed(2)
      : 0;

  // Banners con mejor rendimiento
  const topBanners = [...banners]
    .sort((a, b) => (b.statistics?.clicks || 0) - (a.statistics?.clicks || 0))
    .slice(0, 5);

  return (
    <div className="banner-stats-container">
      {/* Tarjetas de resumen */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-icon total">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total de Banners</p>
            <p className="stat-value">{totalBanners}</p>
            <p className="stat-detail">{activeBanners} activos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon views">
            <Eye size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Vistas</p>
            <p className="stat-value">{totalViews.toLocaleString()}</p>
            <p className="stat-detail">Impresiones: {totalImpressions.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon clicks">
            <MousePointer size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Clics</p>
            <p className="stat-value">{totalClicks.toLocaleString()}</p>
            <p className="stat-detail">Tasa de interacción</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon ctr">
            <Percent size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">CTR Promedio</p>
            <p className="stat-value">{averageCTR}%</p>
            <p className="stat-detail">Click-Through Rate</p>
          </div>
        </div>
      </div>

      {/* Tabla de banners con mejor rendimiento */}
      <div className="top-banners-section">
        <h3>🏆 Top Banners (Por Clics)</h3>

        {topBanners.length > 0 ? (
          <div className="banners-table">
            <div className="table-header">
              <div className="col-title">Banner</div>
              <div className="col-type">Tipo</div>
              <div className="col-stat">Vistas</div>
              <div className="col-stat">Clics</div>
              <div className="col-stat">Impresiones</div>
              <div className="col-stat">CTR</div>
            </div>

            {topBanners.map((banner) => {
              const ctr = banner.statistics?.impressions > 0
                ? ((banner.statistics.clicks / banner.statistics.impressions) * 100).toFixed(2)
                : 0;

              return (
                <div key={banner._id} className="table-row">
                  <div className="col-title">
                    <div className="banner-thumbnail">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/40x40?text=IMG';
                        }}
                      />
                    </div>
                    <span>{banner.title}</span>
                  </div>
                  <div className="col-type">
                    <span className={`type-badge ${banner.type}`}>{banner.type}</span>
                  </div>
                  <div className="col-stat">{banner.statistics?.views || 0}</div>
                  <div className="col-stat">{banner.statistics?.clicks || 0}</div>
                  <div className="col-stat">{banner.statistics?.impressions || 0}</div>
                  <div className="col-stat">{ctr}%</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>Sin datos de rendimiento aún</p>
          </div>
        )}
      </div>

      {/* Indicadores de estado */}
      <div className="status-indicators">
        <div className="indicator">
          <span className="indicator-label">Banners Activos:</span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${totalBanners > 0 ? (activeBanners / totalBanners) * 100 : 0}%`
              }}
            />
          </div>
          <span className="indicator-value">
            {activeBanners}/{totalBanners}
          </span>
        </div>

        <div className="indicator">
          <span className="indicator-label">Tasa de Interacción:</span>
          <div className="progress-bar">
            <div
              className="progress-fill engagement"
              style={{
                width: `${Math.min(averageCTR, 100)}%`
              }}
            />
          </div>
          <span className="indicator-value">{averageCTR}%</span>
        </div>
      </div>
    </div>
  );
};

export default BannerStats;
