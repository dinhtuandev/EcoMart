import { AxiosError } from 'axios';

/**
 * Cấu trúc Response chuẩn từ Spring Boot Backend
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode?: string;
}

/**
 * Cấu trúc Error Response chuẩn RFC 7807 từ GlobalExceptionHandler
 */
export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errorCode?: string;
  errors?: Record<string, string>;
  timestamp?: string;
}

/**
 * Type-safe Axios Error với payload lỗi từ Backend
 */
export type CustomAxiosError = AxiosError<ApiErrorResponse>;

/**
 * Cấu trúc Phân trang dữ liệu từ Spring Boot PageResponse
 */
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/**
 * Thực thể Người dùng
 */
export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: 'CUSTOMER' | 'ADMIN';
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt?: string;
}

/**
 * Dữ liệu trả về khi Đăng nhập / Xác thực OTP thành công
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

/**
 * Payload Đăng nhập
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Payload Đăng ký tài khoản
 */
export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

/**
 * Response sau khi gọi đăng ký tài khoản
 */
export interface RegisterResponse {
  email: string;
  message: string;
  otpCode?: string;
}

/**
 * Payload Xác thực OTP Kích hoạt Email
 */
export interface VerifyEmailPayload {
  email: string;
  otpCode: string;
}

/**
 * Payload Gửi lại mã OTP
 */
export interface ResendOtpPayload {
  email: string;
}

/**
 * Payload Cấp mới Access Token
 */
export interface RefreshTokenPayload {
  refreshToken: string;
}

/**
 * Payload Yêu cầu Quên mật khẩu
 */
export interface ForgotPasswordPayload {
  email: string;
}

/**
 * Response sau khi yêu cầu Quên mật khẩu
 */
export interface ForgotPasswordResponse {
  email: string;
  message: string;
  resetToken?: string;
}

/**
 * Payload Đặt lại mật khẩu bằng mã OTP
 */
export interface ResetPasswordOtpPayload {
  email: string;
  otpCode: string;
  newPassword: string;
}

/**
 * Trạng thái Auth State trong AuthProvider
 */
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

/**
 * Discriminated Union cho các Auth Actions
 */
export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'LOGOUT' };

/**
 * Kiểu thông báo Toast
 */
export type ToastType = 'success' | 'error' | 'warning';

/**
 * Đối tượng Toast trong danh sách thông báo
 */
export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

/**
 * Context Interface cho hệ thống Toast
 */
export interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

// ==========================================
// MODULE 2: USER PROFILE & ADMIN USERS TYPES
// ==========================================

/**
 * Payload Cập nhật thông tin cá nhân
 */
export interface UpdateProfilePayload {
  fullName: string;
  phoneNumber?: string;
}

/**
 * Payload Đổi mật khẩu
 */
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Payload Khóa / Mở khóa tài khoản người dùng
 */
export interface UpdateUserStatusPayload {
  isActive: boolean;
}

/**
 * Tham số lọc danh sách người dùng cho Admin
 */
export interface AdminUsersFilterParams {
  keyword?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

// ==========================================
// MODULE 3: ADDRESS MANAGEMENT TYPES
// ==========================================

/**
 * Thực thể Địa chỉ nhận hàng
 */
export interface Address {
  id: number;
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault: boolean;
}

/**
 * Payload Thêm / Sửa địa chỉ nhận hàng
 */
export interface AddressPayload {
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault?: boolean;
}
