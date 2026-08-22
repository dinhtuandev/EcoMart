import axiosClient from './axiosClient';

export const productApi = {
  searchProducts: (params) => axiosClient.get('/products', { params }),
  getProductDetail: (id) => axiosClient.get(`/products/${id}`),
  getProductReviews: (id, params) => axiosClient.get(`/products/${id}/reviews`, { params }),
  
  // Admin APIs
  adminGetProducts: (params) => axiosClient.get('/admin/products', { params }),
  adminCreateProduct: (data) => axiosClient.post('/admin/products', data),
  adminGetProductDetail: (id) => axiosClient.get(`/admin/products/${id}`),
  adminUpdateProduct: (id, data) => axiosClient.patch(`/admin/products/${id}`, data),
  adminUpdateProductImages: (id, images) => axiosClient.put(`/admin/products/${id}/images`, images),
};
