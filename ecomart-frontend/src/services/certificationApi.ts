import axiosClient from '../lib/axiosClient';
import { ApiResponse, Certification, CertificationPayload } from '../types';

/**
 * Service quản lý Chứng nhận sinh thái Eco (Certification API)
 * Hỗ trợ các API Public cho khách hàng và API Quản trị cho Admin
 */
export const certificationApi = {
  /**
   * Lấy danh sách chứng nhận sinh thái đang hoạt động (Public)
   */
  getCertifications: (signal?: AbortSignal): Promise<ApiResponse<Certification[]>> =>
    axiosClient.get('/certifications', { signal }),

  /**
   * Lấy toàn bộ chứng nhận sinh thái cho Admin (bao gồm cả chứng nhận ẩn)
   */
  adminGetCertifications: (signal?: AbortSignal): Promise<ApiResponse<Certification[]>> =>
    axiosClient.get('/admin/certifications', { signal }),

  /**
   * Admin tạo mới chứng nhận sinh thái
   */
  adminCreateCertification: (
    payload: CertificationPayload
  ): Promise<ApiResponse<Certification>> =>
    axiosClient.post('/admin/certifications', payload),

  /**
   * Admin cập nhật thông tin chứng nhận sinh thái
   */
  adminUpdateCertification: (
    certificationId: number,
    payload: CertificationPayload
  ): Promise<ApiResponse<Certification>> =>
    axiosClient.patch(`/admin/certifications/${certificationId}`, payload),
};

export default certificationApi;
