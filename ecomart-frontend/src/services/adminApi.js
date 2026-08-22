import axiosClient from './axiosClient';

export const adminApi = {
  getDashboardStats: () => axiosClient.get('/admin/dashboard'),
  getRevenueReport: (params) => axiosClient.get('/admin/reports/revenue', { params }),
  getInventory: (params) => axiosClient.get('/admin/inventory', { params }),
  updateInventory: (productId, data) => axiosClient.patch(`/admin/inventory/${productId}`, data),
  getUsers: (params) => axiosClient.get('/admin/users', { params }),
  updateUserStatus: (userId, data) => axiosClient.patch(`/admin/users/${userId}/status`, data),
};
