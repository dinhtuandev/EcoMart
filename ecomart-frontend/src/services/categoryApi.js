import axiosClient from './axiosClient';

export const categoryApi = {
  getAll: () => axiosClient.get('/categories'),
  getById: (id) => axiosClient.get(`/categories/${id}`),
};
