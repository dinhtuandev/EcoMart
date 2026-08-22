import axiosClient from '../lib/axiosClient';
import {
  ApiResponse,
  PageResponse,
  Order,
  CreateOrderPayload,
  CreateOrderResponse,
  AdminOrderFilterParams,
  AdminCancelOrderPayload,
  UpdatePaymentStatusPayload,
  OrderStatus,
} from '../types';

/**
 * Service quản lý Đơn hàng (Order API)
 * Kết nối Customer & Admin endpoints
 */
export const orderApi = {
  // ==========================================
  // CUSTOMER ENDPOINTS
  // ==========================================

  /**
   * Tạo đơn hàng mới từ toàn bộ giỏ hàng hiện tại
   * Backend sẽ lấy tất cả items trong giỏ hàng
   */
  createOrder: (
    data: CreateOrderPayload
  ): Promise<ApiResponse<CreateOrderResponse>> =>
    axiosClient.post('/orders', data),

  /**
   * Lấy danh sách đơn hàng của khách hàng (có lọc theo trạng thái + phân trang)
   */
  getOrders: (params: {
    status?: OrderStatus;
    page: number;
    pageSize: number;
  }): Promise<ApiResponse<PageResponse<Order>>> =>
    axiosClient.get('/orders', { params }),

  /**
   * Lấy chi tiết một đơn hàng của khách hàng
   */
  getOrderDetail: (orderId: number): Promise<ApiResponse<Order>> =>
    axiosClient.get(`/orders/${orderId}`),

  /**
   * Khách hàng tự hủy đơn hàng (chỉ được hủy khi PENDING)
   */
  cancelOrder: (orderId: number): Promise<ApiResponse<Order>> =>
    axiosClient.post(`/orders/${orderId}/cancel`),

  /**
   * Khách hàng thử lại thanh toán (cho đơn PENDING chưa thanh toán)
   */
  retryPayment: (
    orderId: number
  ): Promise<ApiResponse<CreateOrderResponse>> =>
    axiosClient.post(`/orders/${orderId}/retry-payment`),

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  /**
   * Admin lấy danh sách toàn bộ đơn hàng với bộ lọc đa tiêu chí
   */
  adminGetOrders: (
    params: AdminOrderFilterParams,
    signal?: AbortSignal
  ): Promise<ApiResponse<PageResponse<Order>>> =>
    axiosClient.get('/admin/orders', { params, signal }),

  /**
   * Admin xem chi tiết một đơn hàng bất kỳ
   */
  adminGetOrderDetail: (orderId: number): Promise<ApiResponse<Order>> =>
    axiosClient.get(`/admin/orders/${orderId}`),

  /**
   * Admin xác nhận đơn hàng (PENDING → CONFIRMED)
   */
  adminConfirmOrder: (orderId: number): Promise<ApiResponse<Order>> =>
    axiosClient.post(`/admin/orders/${orderId}/confirm`),

  /**
   * Admin hoàn thành đơn hàng (CONFIRMED → COMPLETED)
   */
  adminCompleteOrder: (orderId: number): Promise<ApiResponse<Order>> =>
    axiosClient.post(`/admin/orders/${orderId}/complete`),

  /**
   * Admin hủy đơn hàng với lý do (PENDING/CONFIRMED → CANCELLED)
   */
  adminCancelOrder: (
    orderId: number,
    data: AdminCancelOrderPayload
  ): Promise<ApiResponse<Order>> =>
    axiosClient.post(`/admin/orders/${orderId}/cancel`, data),

  /**
   * Admin cập nhật trạng thái thanh toán
   */
  adminUpdatePaymentStatus: (
    orderId: number,
    data: UpdatePaymentStatusPayload
  ): Promise<ApiResponse<Order>> =>
    axiosClient.patch(`/admin/orders/${orderId}/payment-status`, data),
};

export default orderApi;
