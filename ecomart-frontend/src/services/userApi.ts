import axiosClient from '../lib/axiosClient';
import {
  ApiResponse,
  User,
  PageResponse,
  UpdateProfilePayload,
  ChangePasswordPayload,
  UpdateUserStatusPayload,
  AdminUsersFilterParams,
} from '../types';

/**
 * Service xử lý toàn bộ API liên quan đến Hồ sơ người dùng và Quản trị khách hàng
 */
export const userApi = {
  /**
   * Lấy thông tin cá nhân của người dùng đang đăng nhập
   */
  getProfile: (signal?: AbortSignal): Promise<ApiResponse<User>> =>
    axiosClient.get('/me', { signal }),

  /**
   * Cập nhật thông tin cá nhân (Họ tên, SĐT)
   */
  updateProfile: (payload: UpdateProfilePayload): Promise<ApiResponse<User>> =>
    axiosClient.patch('/me', payload),

  /**
   * Đổi mật khẩu cá nhân
   */
  changePassword: (
    payload: ChangePasswordPayload
  ): Promise<ApiResponse<void>> =>
    axiosClient.patch('/me/password', payload),

  /**
   * [ADMIN] Lấy danh sách người dùng phân trang và tìm kiếm
   */
  adminGetUsers: (
    params?: AdminUsersFilterParams,
    signal?: AbortSignal
  ): Promise<ApiResponse<PageResponse<User>>> =>
    axiosClient.get('/admin/users', { params, signal }),

  /**
   * [ADMIN] Cập nhật trạng thái hoạt động (Khóa / Mở khóa) của người dùng
   */
  adminUpdateUserStatus: (
    userId: number,
    payload: UpdateUserStatusPayload
  ): Promise<ApiResponse<User>> =>
    axiosClient.patch(`/admin/users/${userId}/status`, payload),
};

export default userApi;
