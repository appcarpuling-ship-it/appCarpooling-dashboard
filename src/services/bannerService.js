import api from './api';

const BASE = '/banners';

export const getAllSections = async () => {
  const response = await api.get(`${BASE}/sections`);
  return response.data;
};

export const getBannersBySection = async (sectionTitle, isActive = null) => {
  let url = `${BASE}/section/${encodeURIComponent(sectionTitle)}`;
  if (isActive !== null) url += `?isActive=${isActive}`;
  const response = await api.get(url);
  return response.data;
};

export const getBannerById = async (id) => {
  const response = await api.get(`${BASE}/${id}`);
  return response.data;
};

export const createBanner = async (bannerData) => {
  const response = await api.post(BASE, bannerData);
  return response.data;
};

export const updateBanner = async (id, bannerData) => {
  const response = await api.put(`${BASE}/${id}`, bannerData);
  return response.data;
};

export const toggleBannerStatus = async (id) => {
  const response = await api.patch(`${BASE}/${id}/toggle-status`);
  return response.data;
};

export const reorderBanners = async (sectionTitle, banners) => {
  const response = await api.patch(
    `${BASE}/reorder/${encodeURIComponent(sectionTitle)}`,
    { banners }
  );
  return response.data;
};

export const getBannerStats = async (sectionTitle) => {
  const response = await api.get(`${BASE}/stats/${encodeURIComponent(sectionTitle)}`);
  return response.data;
};

export const registerBannerView = async (id) => {
  const response = await api.post(`${BASE}/${id}/register-view`);
  return response.data;
};

export const registerBannerClick = async (id) => {
  const response = await api.post(`${BASE}/${id}/register-click`);
  return response.data;
};

export const deleteBanner = async (id) => {
  const response = await api.delete(`${BASE}/${id}`);
  return response.data;
};

export default {
  getAllSections,
  getBannersBySection,
  getBannerById,
  createBanner,
  updateBanner,
  toggleBannerStatus,
  reorderBanners,
  getBannerStats,
  registerBannerView,
  registerBannerClick,
  deleteBanner,
};
