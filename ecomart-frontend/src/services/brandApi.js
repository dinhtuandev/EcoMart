import axiosClient from './axiosClient';

export const brandApi = {
  getActiveBrands: () => axiosClient.get('/brands'),
  adminGetBrands: () => axiosClient.get('/admin/brands'),
  adminCreateBrand: (data) => axiosClient.post('/admin/brands', data),
  adminUpdateBrand: (id, data) => axiosClient.patch(`/admin/brands/${id}`, data),
};
