import axiosClient from '../lib/axiosClient';
import { ApiResponse, Address, AddressPayload } from '../types';

/**
 * Service xử lý toàn bộ API Sổ địa chỉ giao hàng của người dùng
 */
export const addressApi = {
  /**
   * Lấy danh sách địa chỉ giao hàng của người dùng hiện tại
   */
  getAddresses: (signal?: AbortSignal): Promise<ApiResponse<Address[]>> =>
    axiosClient.get('/me/addresses', { signal }),

  /**
   * Thêm mới địa chỉ giao hàng
   */
  createAddress: (payload: AddressPayload): Promise<ApiResponse<Address>> =>
    axiosClient.post('/me/addresses', payload),

  /**
   * Cập nhật địa chỉ giao hàng
   */
  updateAddress: (
    addressId: number,
    payload: AddressPayload
  ): Promise<ApiResponse<Address>> =>
    axiosClient.patch(`/me/addresses/${addressId}`, payload),

  /**
   * Xóa địa chỉ giao hàng
   */
  deleteAddress: (addressId: number): Promise<void> =>
    axiosClient.delete(`/me/addresses/${addressId}`),
};

export default addressApi;
