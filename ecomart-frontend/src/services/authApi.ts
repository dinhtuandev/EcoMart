import axiosClient from '../lib/axiosClient';
import {
  ApiResponse,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  VerifyEmailPayload,
  ResendOtpPayload,
  RefreshTokenPayload,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordOtpPayload,
  SocialConfigResponse,
  SocialLoginPayload,
  User,
} from '../types';

/**
 * Service xử lý toàn bộ các API xác thực và tài khoản cho EcoMart
 */
export const authApi = {
  /**
   * Lấy cấu hình Client ID của Google / Facebook từ Backend
   */
  getSocialConfig: (): Promise<ApiResponse<SocialConfigResponse>> =>
    axiosClient.get('/auth/social-config'),

  /**
   * Đăng nhập với email và mật khẩu
   */
  login: (payload: LoginPayload): Promise<ApiResponse<AuthResponse>> =>
    axiosClient.post('/auth/login', payload),

  /**
   * Đăng nhập thông qua Mạng xã hội (Google / Facebook)
   */
  socialLogin: (
    payload: SocialLoginPayload
  ): Promise<ApiResponse<AuthResponse>> =>
    axiosClient.post('/auth/social-login', payload),

  /**
   * Đăng ký tài khoản mới (tạo OTP gửi qua Resend)
   */
  register: (payload: RegisterPayload): Promise<ApiResponse<RegisterResponse>> =>
    axiosClient.post('/auth/register', payload),

  /**
   * Xác thực tài khoản qua mã OTP 6 số gửi về Email
   */
  verifyEmail: (
    payload: VerifyEmailPayload
  ): Promise<ApiResponse<AuthResponse>> =>
    axiosClient.post('/auth/verify-email', payload),

  /**
   * Gửi lại mã OTP xác thực email (áp dụng Cooldown 60s & Rate limit)
   */
  resendOtp: (payload: ResendOtpPayload): Promise<ApiResponse<void>> =>
    axiosClient.post('/auth/resend-verification', payload),

  /**
   * Làm mới Access Token bằng Refresh Token
   */
  refreshToken: (
    payload: RefreshTokenPayload
  ): Promise<ApiResponse<AuthResponse>> =>
    axiosClient.post('/auth/refresh-token', payload),

  /**
   * Lấy thông tin tài khoản của phiên đăng nhập hiện tại (có hỗ trợ AbortSignal)
   */
  getMe: (signal?: AbortSignal): Promise<ApiResponse<User>> =>
    axiosClient.get('/auth/me', { signal }),

  /**
   * Yêu cầu mã OTP đặt lại mật khẩu qua email
   */
  forgotPassword: (
    payload: ForgotPasswordPayload
  ): Promise<ApiResponse<ForgotPasswordResponse>> =>
    axiosClient.post('/auth/forgot-password', payload),

  /**
   * Đặt lại mật khẩu mới bằng mã OTP 6 số
   */
  resetPasswordOtp: (
    payload: ResetPasswordOtpPayload
  ): Promise<ApiResponse<void>> =>
    axiosClient.post('/auth/reset-password-otp', payload),
};
