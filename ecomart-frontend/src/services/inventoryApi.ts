import axiosClient from '../lib/axiosClient';
import {
  ApiResponse,
  PageResponse,
  InventoryItem,
  UpdateInventoryPayload,
} from '../types';

/**
 * Service Quản lý Tồn kho Admin (Inventory API)
 */
export const inventoryApi = {
  /**
   * Lấy danh sách tồn kho sản phẩm (có lọc sắp hết hàng)
   */
  getInventory: (params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    lowStockOnly?: boolean;
  }): Promise<ApiResponse<PageResponse<InventoryItem>>> =>
    axiosClient.get('/admin/inventory', { params }),

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
