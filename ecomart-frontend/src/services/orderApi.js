import axiosClient from './axiosClient';

export const orderApi = {
  createOrder: (data) => axiosClient.post('/orders', data),
  getOrders: (params) => axiosClient.get('/orders', { params }),
  getOrderDetail: (id) => axiosClient.get(`/orders/${id}`),
  cancelOrder: (id) => axiosClient.post(`/orders/${id}/cancel`),
  
  // Admin APIs
  adminGetOrders: (params) => axiosClient.get('/admin/orders', { params }),
  adminGetOrderDetail: (id) => axiosClient.get(`/admin/orders/${id}`),
  adminConfirmOrder: (id) => axiosClient.post(`/admin/orders/${id}/confirm`),
  adminCancelOrder: (id, data) => axiosClient.post(`/admin/orders/${id}/cancel`, data),
  adminCompleteOrder: (id) => axiosClient.post(`/admin/orders/${id}/complete`),
};
