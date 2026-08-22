import axiosClient from './axiosClient';

export const reviewApi = {
  createReview: (data) => axiosClient.post('/reviews', data),
  updateReview: (id, data) => axiosClient.patch(`/reviews/${id}`, data),
  getMyReviews: (params) => axiosClient.get('/me/reviews', { params }),
  
  // Admin APIs
  adminGetReviews: (params) => axiosClient.get('/admin/reviews', { params }),
  adminUpdateVisibility: (id, data) => axiosClient.patch(`/admin/reviews/${id}/visibility`, data),
};
