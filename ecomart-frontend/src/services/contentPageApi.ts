import axiosClient from '../lib/axiosClient';
import { ApiResponse, ContentPage, UpdateContentPagePayload } from '../types';

/**
 * Service quản lý Trang nội dung / Chính sách (Content Page API)
 */
export const contentPageApi = {
  /**
   * Lấy danh sách tất cả các trang nội dung (Public)
   */
  getAllPages: (signal?: AbortSignal): Promise<ApiResponse<ContentPage[]>> =>
    axiosClient.get('/pages', { signal }),

  /**
   * Lấy chi tiết một trang theo slug (Public)
   */
  getPageBySlug: (slug: string, signal?: AbortSignal): Promise<ApiResponse<ContentPage>> =>
    axiosClient.get(`/pages/${slug}`, { signal }),

  /**
   * Cập nhật nội dung trang theo slug (Admin)
   */
  updatePage: (
    slug: string,
    payload: UpdateContentPagePayload
  ): Promise<ApiResponse<ContentPage>> =>
    axiosClient.patch(`/admin/pages/${slug}`, payload),
};

export default contentPageApi;
