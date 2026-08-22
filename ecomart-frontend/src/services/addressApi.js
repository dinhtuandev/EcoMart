import axiosClient from './axiosClient';

export const addressApi = {
  getAddresses: () => axiosClient.get('/me/addresses'),
  createAddress: (data) => axiosClient.post('/me/addresses', data),
  updateAddress: (id, data) => axiosClient.patch(`/me/addresses/${id}`, data),
  deleteAddress: (id) => axiosClient.delete(`/me/addresses/${id}`),
};
