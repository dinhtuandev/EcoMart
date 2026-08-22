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
};

export default paymentApi;
