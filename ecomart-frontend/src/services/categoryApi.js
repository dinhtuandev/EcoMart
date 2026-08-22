import axiosClient from './axiosClient';

export const categoryApi = {
  getActiveCategories: () => axiosClient.get('/categories'),
  adminGetCategories: () => axiosClient.get('/admin/categories'),
  adminCreateCategory: (data) => axiosClient.post('/admin/categories', data),
  adminUpdateCategory: (id, data) => axiosClient.patch(`/admin/categories/${id}`, data),
};
