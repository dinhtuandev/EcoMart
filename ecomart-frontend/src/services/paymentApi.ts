import axiosClient from '../lib/axiosClient';
import { ApiResponse, VNPayReturnResponse } from '../types';

/**
 * Service xử lý cổng thanh toán trực tuyến
 */
export const paymentApi = {
  /**
   * Xử lý kết quả trả về từ cổng thanh toán VNPay
   */
  getVNPayReturn: (
    params: Record<string, string>
  ): Promise<ApiResponse<VNPayReturnResponse>> =>
    axiosClient.get('/payments/vnpay/return', { params }),

  /**
   * Giả lập thanh toán thành công (VNPay / SePay / Mock)
   */
  mockPaymentSuccess: (payload: {
    orderId?: number;
    orderCode?: string;
    gateway?: 'VNPAY' | 'SEPAY' | 'COD';
  }): Promise<ApiResponse<void>> =>
    axiosClient.post('/payments/mock/success', payload),
};

export default paymentApi;
