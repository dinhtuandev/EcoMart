import axiosClient from '../lib/axiosClient';
import { ApiResponse, Category, CategoryPayload } from '../types';

/**
 * Service quản lý Danh mục sản phẩm (Category API)
 * Hỗ trợ các API Public cho khách hàng và API Quản trị cho Admin
 */
export const categoryApi = {
  /**
   * Lấy danh sách danh mục đang hoạt động (Public)
   */
  getCategories: (signal?: AbortSignal): Promise<ApiResponse<Category[]>> =>
    axiosClient.get('/categories', { signal }),

  /**
   * Lấy toàn bộ danh mục sản phẩm cho Admin (bao gồm cả danh mục ẩn)
   */
  adminGetCategories: (signal?: AbortSignal): Promise<ApiResponse<Category[]>> =>
    axiosClient.get('/admin/categories', { signal }),

  /**
   * Admin tạo mới danh mục sản phẩm
   */
  adminCreateCategory: (payload: CategoryPayload): Promise<ApiResponse<Category>> =>
    axiosClient.post('/admin/categories', payload),

  /**
   * Admin cập nhật danh mục sản phẩm
   */
  adminUpdateCategory: (
    categoryId: number,
    payload: CategoryPayload
  ): Promise<ApiResponse<Category>> =>
    axiosClient.patch(`/admin/categories/${categoryId}`, payload),
};

export default categoryApi;
