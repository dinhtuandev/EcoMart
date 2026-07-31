import axiosClient from './axiosClient';

export const productApi = {
  getAll: (params) => axiosClient.get('/products', { params }),
  getById: (id) => axiosClient.get(`/products/${id}`),
};
