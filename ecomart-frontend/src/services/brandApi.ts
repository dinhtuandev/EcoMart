import axiosClient from '../lib/axiosClient';
import { ApiResponse, Brand, BrandPayload } from '../types';

/**
 * Service quản lý Thương hiệu đối tác (Brand API)
 * Hỗ trợ các API Public cho khách hàng và API Quản trị cho Admin
 */
export const brandApi = {
  /**
   * Lấy danh sách thương hiệu đang hoạt động (Public)
   */
  getBrands: (signal?: AbortSignal): Promise<ApiResponse<Brand[]>> =>
    axiosClient.get('/brands', { signal }),

  /**
   * Lấy toàn bộ thương hiệu cho Admin (bao gồm cả thương hiệu tạm ngưng)
   */
  adminGetBrands: (signal?: AbortSignal): Promise<ApiResponse<Brand[]>> =>
    axiosClient.get('/admin/brands', { signal }),

  /**
   * Admin tạo mới thương hiệu
   */
  adminCreateBrand: (payload: BrandPayload): Promise<ApiResponse<Brand>> =>
    axiosClient.post('/admin/brands', payload),

  /**
   * Admin cập nhật thương hiệu
   */
  adminUpdateBrand: (
    brandId: number,
    payload: BrandPayload
  ): Promise<ApiResponse<Brand>> =>
    axiosClient.patch(`/admin/brands/${brandId}`, payload),
};

export default brandApi;
