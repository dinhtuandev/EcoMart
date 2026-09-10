import axiosClient from '../lib/axiosClient';
import {
  ApiResponse,
  PageResponse,
  Review,
  ProductReviewSummary,
  CreateReviewPayload,
  UpdateReviewPayload,
  UpdateReviewVisibilityPayload,
  AdminReviewFilterParams,
} from '../types';

/**
 * Service quản lý Đánh giá sản phẩm (Review API)
 * Kết nối Customer, Public và Admin endpoints
 */
export const reviewApi = {
  // ==========================================
  // CUSTOMER ENDPOINTS
  // ==========================================

  /**
   * Tạo đánh giá mới cho sản phẩm đã mua
   */
  createReview: (payload: CreateReviewPayload): Promise<ApiResponse<Review>> =>
    axiosClient.post('/reviews', payload),

  /**
   * Cập nhật đánh giá của bản thân
   */
  updateReview: (
    reviewId: number,
    payload: UpdateReviewPayload
  ): Promise<ApiResponse<Review>> =>
    axiosClient.patch(`/reviews/${reviewId}`, payload),

  /**
   * Lấy danh sách đánh giá của chính người dùng hiện tại
   */
  getMyReviews: (params: {
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PageResponse<Review>>> =>
    axiosClient.get('/me/reviews', { params }),

  // ==========================================
  // PUBLIC ENDPOINTS
  // ==========================================

  /**
   * Lấy danh sách và thống kê đánh giá công khai của 1 sản phẩm
   */
  getProductReviews: (
    productId: number,
    params?: {
      rating?: number;
      page?: number;
      pageSize?: number;
    }
  ): Promise<ApiResponse<ProductReviewSummary>> =>
    axiosClient.get(`/products/${productId}/reviews`, { params }),

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  /**
   * Admin lấy danh sách toàn bộ đánh giá kèm bộ lọc đa tiêu chí
   */
  adminGetReviews: (
    params: AdminReviewFilterParams,
    signal?: AbortSignal
  ): Promise<ApiResponse<PageResponse<Review>>> =>
    axiosClient.get('/admin/reviews', { params, signal }),

  /**
   * Admin xem chi tiết một đánh giá
   */
  adminGetReviewDetail: (reviewId: number): Promise<ApiResponse<Review>> =>
    axiosClient.get(`/admin/reviews/${reviewId}`),

  /**
   * Admin ẩn/hiện đánh giá vi phạm hoặc hợp lệ
   */
  adminUpdateVisibility: (
    reviewId: number,
    payload: UpdateReviewVisibilityPayload
  ): Promise<ApiResponse<Review>> =>
    axiosClient.patch(`/admin/reviews/${reviewId}/visibility`, payload),
};

export default reviewApi;
