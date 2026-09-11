import axiosClient from '../lib/axiosClient';
import {
  ApiResponse,
  PageResponse,
  ReturnEligibilityResponse,
  ReturnRequest,
  CreateReturnPayload,
  ReturnRequestStatus,
  ReturnRequestType,
} from '../types';

export const returnApi = {
  // ==========================================
  // CUSTOMER ENDPOINTS
  // ==========================================

  checkEligibility: (orderId: number): Promise<ApiResponse<ReturnEligibilityResponse>> =>
    axiosClient.get(`/returns/eligibility/${orderId}`),

  uploadFiles: (files: File[]): Promise<ApiResponse<string[]>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return axiosClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  createReturn: (data: CreateReturnPayload): Promise<ApiResponse<ReturnRequest>> =>
    axiosClient.post('/returns', data),

  getMyReturns: (params: {
    status?: ReturnRequestStatus;
    page: number;
    pageSize: number;
  }): Promise<ApiResponse<PageResponse<ReturnRequest>>> =>
    axiosClient.get('/returns/my-requests', { params }),

  getReturnDetail: (requestId: number): Promise<ApiResponse<ReturnRequest>> =>
    axiosClient.get(`/returns/${requestId}`),

  cancelReturn: (requestId: number): Promise<ApiResponse<ReturnRequest>> =>
    axiosClient.post(`/returns/${requestId}/cancel`),

  // ==========================================
  // MANAGER / ADMIN ENDPOINTS
  // ==========================================

  getAdminReturns: (params: {
    status?: ReturnRequestStatus;
    type?: ReturnRequestType;
    keyword?: string;
    page: number;
    pageSize: number;
  }): Promise<ApiResponse<PageResponse<ReturnRequest>>> =>
    axiosClient.get('/admin/returns', { params }),

  getAdminReturnDetail: (requestId: number): Promise<ApiResponse<ReturnRequest>> =>
    axiosClient.get(`/admin/returns/${requestId}`),

  approveReturn: (requestId: number, adminNote?: string): Promise<ApiResponse<ReturnRequest>> =>
    axiosClient.post(`/admin/returns/${requestId}/approve`, { adminNote }),

  rejectReturn: (requestId: number, rejectionReason: string): Promise<ApiResponse<ReturnRequest>> =>
    axiosClient.post(`/admin/returns/${requestId}/reject`, { rejectionReason }),

  processQC: (
    requestId: number,
    data: { qcPassed: boolean; qcNotes: string; action?: ReturnRequestType }
  ): Promise<ApiResponse<ReturnRequest>> =>
    axiosClient.post(`/admin/returns/${requestId}/qc`, data),
};
