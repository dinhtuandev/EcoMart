import axiosClient from '../lib/axiosClient';
import {
  ApiResponse,
  PageResponse,
  InventoryItem,
  UpdateInventoryPayload,
  AdminInventoryFilterParams,
} from '../types';

/**
 * Service Quản lý Tồn kho Admin (Inventory API)
 */
export const inventoryApi = {
  /**
   * Lấy danh sách tồn kho sản phẩm (có lọc sắp hết hàng)
   */
  getAdminInventory: (
    params?: AdminInventoryFilterParams,
    signal?: AbortSignal
  ): Promise<ApiResponse<PageResponse<InventoryItem>>> =>
    axiosClient.get('/admin/inventory', { params, signal }),

  /**
   * Alias tương thích getInventory
   */
  getInventory: (
    params?: AdminInventoryFilterParams,
    signal?: AbortSignal
  ): Promise<ApiResponse<PageResponse<InventoryItem>>> =>
    axiosClient.get('/admin/inventory', { params, signal }),

  /**
   * Cập nhật số lượng tồn kho sản phẩm
   */
  updateStock: (
    productId: number,
    payload: UpdateInventoryPayload
  ): Promise<ApiResponse<InventoryItem>> =>
    axiosClient.patch(`/admin/inventory/${productId}`, payload),
};

export default inventoryApi;
