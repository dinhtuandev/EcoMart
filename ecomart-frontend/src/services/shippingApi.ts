import axiosClient from '../lib/axiosClient';
import {
  ApiResponse,
  PageResponse,
  ShippingOrder,
  ShippingCarrier,
  ShippingStatus,
  ShippingType,
} from '../types';

export const shippingApi = {
  // Public / Customer tracking
  track: (trackingNumber: string): Promise<ApiResponse<ShippingOrder>> =>
    axiosClient.get(`/shipping/track/${trackingNumber}`),

  estimateFee: (params: {
    fromProvince: string;
    toProvince: string;
    weightKg?: number;
    type?: ShippingType;
  }): Promise<ApiResponse<number>> =>
    axiosClient.get('/shipping/estimate-fee', { params }),

  // Manager / Admin endpoints
  getAdminShippings: (params: {
    type?: ShippingType;
    status?: ShippingStatus;
    carrier?: ShippingCarrier;
    page: number;
    pageSize: number;
  }): Promise<ApiResponse<PageResponse<ShippingOrder>>> =>
    axiosClient.get('/admin/shipping', { params }),

  updateStatus: (
    trackingNumber: string,
    data: { status: ShippingStatus; location?: string; note?: string }
  ): Promise<ApiResponse<ShippingOrder>> =>
    axiosClient.patch(`/admin/shipping/${trackingNumber}/status`, data),

  // Simulator Fast-Forward
  advanceSimulation: (trackingNumber?: string): Promise<ApiResponse<any>> =>
    axiosClient.post('/admin/shipping/simulator/advance', null, {
      params: trackingNumber ? { trackingNumber } : undefined,
    }),
};
