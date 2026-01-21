import api from './api';

const ENDPOINTS = {
  BANNERS: '/banners',
  BANNER_BY_ID: '/banners/:id',
  BANNERS_BY_PACKAGE: '/banners/package/:packageId',
  TOGGLE_STATUS: '/banners/:id/toggle-status',
  REORDER: '/banners/reorder/:packageId',
  STATS: '/banners/stats/:packageId',
  REGISTER_VIEW: '/banners/:id/register-view',
  REGISTER_CLICK: '/banners/:id/register-click'
};

/**
 * Obtener todos los banners de un paquete
 */
export const getBannersByPackage = async (packageId, isActive = null) => {
  try {
    let url = ENDPOINTS.BANNERS_BY_PACKAGE.replace(':packageId', packageId);
    if (isActive !== null) {
      url += `?isActive=${isActive}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error al obtener banners del paquete:', error);
    throw error;
  }
};

/**
 * Obtener un banner específico
 */
export const getBannerById = async (id) => {
  try {
    const response = await api.get(ENDPOINTS.BANNER_BY_ID.replace(':id', id));
    return response.data;
  } catch (error) {
    console.error('Error al obtener banner:', error);
    throw error;
  }
};

/**
 * Crear un nuevo banner
 */
export const createBanner = async (bannerData) => {
  try {
    const response = await api.post(ENDPOINTS.BANNERS, bannerData);
    return response.data;
  } catch (error) {
    console.error('Error al crear banner:', error);
    throw error;
  }
};

/**
 * Actualizar un banner
 */
export const updateBanner = async (id, bannerData) => {
  try {
    const response = await api.put(
      ENDPOINTS.BANNER_BY_ID.replace(':id', id),
      bannerData
    );
    return response.data;
  } catch (error) {
    console.error('Error al actualizar banner:', error);
    throw error;
  }
};

/**
 * Cambiar estado del banner (activar/desactivar)
 */
export const toggleBannerStatus = async (id) => {
  try {
    const response = await api.patch(
      ENDPOINTS.TOGGLE_STATUS.replace(':id', id)
    );
    return response.data;
  } catch (error) {
    console.error('Error al cambiar estado del banner:', error);
    throw error;
  }
};

/**
 * Reordenar banners en un paquete
 */
export const reorderBanners = async (packageId, banners) => {
  try {
    const response = await api.patch(
      ENDPOINTS.REORDER.replace(':packageId', packageId),
      { banners }
    );
    return response.data;
  } catch (error) {
    console.error('Error al reordenar banners:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de banners de un paquete
 */
export const getBannerStats = async (packageId) => {
  try {
    const response = await api.get(
      ENDPOINTS.STATS.replace(':packageId', packageId)
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

/**
 * Registrar vista de banner
 */
export const registerBannerView = async (id) => {
  try {
    const response = await api.post(
      ENDPOINTS.REGISTER_VIEW.replace(':id', id)
    );
    return response.data;
  } catch (error) {
    console.error('Error al registrar vista:', error);
    throw error;
  }
};

/**
 * Registrar clic de banner
 */
export const registerBannerClick = async (id) => {
  try {
    const response = await api.post(
      ENDPOINTS.REGISTER_CLICK.replace(':id', id)
    );
    return response.data;
  } catch (error) {
    console.error('Error al registrar clic:', error);
    throw error;
  }
};

/**
 * Eliminar un banner
 */
export const deleteBanner = async (id) => {
  try {
    const response = await api.delete(
      ENDPOINTS.BANNER_BY_ID.replace(':id', id)
    );
    return response.data;
  } catch (error) {
    console.error('Error al eliminar banner:', error);
    throw error;
  }
};

export default {
  getBannersByPackage,
  getBannerById,
  createBanner,
  updateBanner,
  toggleBannerStatus,
  reorderBanners,
  getBannerStats,
  registerBannerView,
  registerBannerClick,
  deleteBanner
};
