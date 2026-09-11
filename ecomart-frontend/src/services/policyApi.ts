import axiosClient from '../lib/axiosClient';
import { ApiResponse, PageResponse, Policy, PolicyPayload, PolicyType } from '../types';

export const policyApi = {
  // Public
  getActivePolicies: (): Promise<ApiResponse<Policy[]>> =>
    axiosClient.get('/policies'),

  // Manager / Admin
  getPolicies: (params: {
    type?: PolicyType;
    isActive?: boolean;
    page: number;
    pageSize: number;
  }): Promise<ApiResponse<PageResponse<Policy>>> =>
    axiosClient.get('/admin/policies', { params }),

  getPolicyById: (id: number): Promise<ApiResponse<Policy>> =>
    axiosClient.get(`/admin/policies/${id}`),

  createPolicy: (data: PolicyPayload): Promise<ApiResponse<Policy>> =>
    axiosClient.post('/admin/policies', data),

  updatePolicy: (id: number, data: PolicyPayload): Promise<ApiResponse<Policy>> =>
    axiosClient.put(`/admin/policies/${id}`, data),

  deletePolicy: (id: number): Promise<ApiResponse<void>> =>
    axiosClient.delete(`/admin/policies/${id}`),
};
