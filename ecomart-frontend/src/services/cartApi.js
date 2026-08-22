import axiosClient from './axiosClient';

export const cartApi = {
  getCart: () => axiosClient.get('/cart'),
  addToCart: (data) => axiosClient.post('/cart/items', data),
  updateCartItem: (cartItemId, data) => axiosClient.patch(`/cart/items/${cartItemId}`, data),
  removeCartItem: (cartItemId) => axiosClient.delete(`/cart/items/${cartItemId}`),
};
