import axiosClient from './axiosClient';

export const orderApi = {
  create: (orderData) => axiosClient.post('/orders', orderData),
  getMyOrders: (params) => axiosClient.get('/orders', { params }),
  getById: (id) => axiosClient.get(`/orders/${id}`),
  cancelOrder: (id) => axiosClient.post(`/orders/${id}/cancel`),
};
