import axiosClient from '../lib/axiosClient';
import {
  ApiResponse,
  PageResponse,
  ContactMessage,
  CreateContactMessagePayload,
  AdminContactFilterParams,
} from '../types';

/**
 * Service quản lý Tin nhắn liên hệ (Contact Message API)
 */
export const contactApi = {
  // ==========================================
  // PUBLIC / CUSTOMER ENDPOINTS
  // ==========================================

  /**
   * Gửi tin nhắn liên hệ mới từ khách hàng
   */
  sendMessage: (payload: CreateContactMessagePayload): Promise<ApiResponse<ContactMessage>> =>
    axiosClient.post('/contact-messages', payload),

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  /**
   * Lấy danh sách tin nhắn liên hệ kèm bộ lọc
   */
  getAdminMessages: (
    params?: AdminContactFilterParams,
    signal?: AbortSignal
  ): Promise<ApiResponse<PageResponse<ContactMessage>>> =>
    axiosClient.get('/admin/contact-messages', { params, signal }),

  /**
   * Lấy chi tiết một tin nhắn liên hệ
   */
  getAdminMessageDetail: (
    id: number,
    signal?: AbortSignal
  ): Promise<ApiResponse<ContactMessage>> =>
    axiosClient.get(`/admin/contact-messages/${id}`, { signal }),

  /**
   * Đánh dấu tin nhắn liên hệ đã xử lý
   */
  resolveMessage: (id: number): Promise<ApiResponse<ContactMessage>> =>
    axiosClient.patch(`/admin/contact-messages/${id}/resolve`),
};

export default contactApi;
