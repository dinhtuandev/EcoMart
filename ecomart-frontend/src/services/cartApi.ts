import axiosClient from '../lib/axiosClient';
import { ApiResponse, Cart } from '../types';

/**
 * Service quản lý Giỏ hàng (Cart API)
 */
export const cartApi = {
  /**
   * Lấy thông tin giỏ hàng của người dùng hiện tại
   */
  getCart: (signal?: AbortSignal): Promise<ApiResponse<Cart>> =>
    axiosClient.get('/cart', { signal }),

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  addToCart: (
    data: { productId: number; quantity: number }
  ): Promise<ApiResponse<Cart>> =>
    axiosClient.post('/cart/items', data),

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   */
  updateCartItem: (
    cartItemId: number,
    data: { quantity: number }
  ): Promise<ApiResponse<Cart>> =>
    axiosClient.patch(`/cart/items/${cartItemId}`, data),

  /**
   * Xóa 1 sản phẩm khỏi giỏ hàng
   */
  removeCartItem: (cartItemId: number): Promise<ApiResponse<void>> =>
    axiosClient.delete(`/cart/items/${cartItemId}`),

  /**
   * Xóa toàn bộ giỏ hàng (làm trống)
   */
  clearCart: (): Promise<ApiResponse<void>> =>
    axiosClient.delete('/cart'),
};

export default cartApi;
