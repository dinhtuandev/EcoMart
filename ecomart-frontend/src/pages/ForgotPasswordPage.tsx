import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, Mail, Lock, ArrowLeft, RefreshCw, Eye, EyeOff, CheckCircle2, Leaf } from 'lucide-react';
import { authApi } from '../services/authApi';
import { useToast } from '../context/ToastContext';
import OtpInput from '../components/auth/OtpInput';
import { CustomAxiosError } from '../types';

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { showToast } = useToast();
  const navigate = useNavigate();

  // Bước 1: Yêu cầu mã OTP qua Email
  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      showToast('Vui lòng nhập địa chỉ email hợp lệ', 'warning');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await authApi.forgotPassword({ email: email.trim() });
      showToast('Mã OTP đã được gửi đến email của bạn!', 'success');
      setStep(2);
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      const message = customError.response?.data?.message || 'Không tìm thấy tài khoản với email này.';
      setErrorMessage(message);
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bước 2: Nhập OTP và Mật khẩu mới
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (otp.length !== 6) {
      showToast('Vui lòng nhập đủ 6 chữ số OTP', 'warning');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      showToast('Mật khẩu mới phải có tối thiểu 6 ký tự', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp', 'warning');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await authApi.resetPasswordOtp({
        email: email.trim(),
        otpCode: otp,
        newPassword,
      });

      showToast('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.', 'success');
      navigate('/login');
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      const message = customError.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.';
      setErrorMessage(message);
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 shadow-xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            {step === 1 ? <KeyRound className="w-7 h-7" /> : <Leaf className="w-7 h-7" />}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {step === 1 ? 'Quên Mật Khẩu?' : 'Đặt Lại Mật Khẩu'}
          </h1>
          <p className="text-xs text-slate-500">
            {step === 1
              ? 'Nhập email đã đăng ký để nhận mã OTP khôi phục mật khẩu'
              : `Nhập mã OTP 6 số gửi đến ${email} và mật khẩu mới`}
          </p>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Step 1: Form nhập Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Địa chỉ Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang gửi mã...</span>
                </>
              ) : (
                'Gửi Mã OTP'
              )}
            </button>
          </form>
        )}

        {/* Step 2: Form nhập OTP & Mật Khẩu Mới */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Khung hiển thị email và nút đổi email */}
            <div className="flex items-center justify-between bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs">
              <span className="font-semibold text-slate-700 truncate">{email}</span>
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="text-emerald-600 hover:text-emerald-700 font-bold ml-2 hover:underline flex-shrink-0"
              >
                Thay đổi email
              </button>
            </div>

            <div className="space-y-1.5 py-1">
              <label className="text-xs font-bold text-slate-700 block text-center">
                Mã OTP 6 Chữ Số
              </label>
              <OtpInput
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  if (errorMessage) setErrorMessage('');
                }}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Mật khẩu mới</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lưu Mật Khẩu Mới</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer quay lại Login */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 font-bold text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
