import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Lock, Mail, Eye, EyeOff, RefreshCw, Leaf } from 'lucide-react';
import { authApi } from '../services/authApi';
import { useAuth } from '../providers/AuthProvider';
import { useToast } from '../context/ToastContext';
import OtpVerificationModal from '../components/auth/OtpVerificationModal';
import { AuthResponse, CustomAxiosError } from '../types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!email.trim() || !password) {
      showToast('Vui lòng nhập đầy đủ Email và Mật khẩu', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.login({
        email: email.trim(),
        password,
      });

      const authData = response.data;
      login(authData);
      showToast(`Chào mừng trở lại, ${authData.user.fullName}!`, 'success');

      if (authData.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      const message = customError.response?.data?.message || '';
      const errorCode = customError.response?.data?.errorCode;

      // Xử lý trường hợp tài khoản chưa được xác thực OTP
      if (
        message.toLowerCase().includes('chưa kích hoạt') ||
        message.toLowerCase().includes('chưa được xác thực') ||
        errorCode === 'ACCOUNT_NOT_ACTIVATED'
      ) {
        showToast('Tài khoản chưa kích hoạt. Vui lòng xác thực mã OTP!', 'warning');
        setShowOtpModal(true);
        return;
      }

      showToast(message || 'Email hoặc mật khẩu không chính xác.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSuccess = (authData: AuthResponse): void => {
    setShowOtpModal(false);
    login(authData);
    if (authData.user.role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 shadow-xl space-y-6">
        {/* Header Branding EcoMart */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Leaf className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Đăng Nhập EcoMart
          </h1>
          <p className="text-xs text-slate-500">
            Đăng nhập để mua sắm các sản phẩm xanh & bền vững
          </p>
        </div>

        {/* Form Đăng nhập */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email</label>
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Mật khẩu</label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
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
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập</span>
              </>
            )}
          </button>
        </form>

        {/* Footer chuyển trang đăng ký */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>

      {/* Modal xác thực OTP nếu tài khoản chưa kích hoạt */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        email={email}
        onClose={() => setShowOtpModal(false)}
        onSuccess={handleOtpSuccess}
      />
    </div>
  );
};

export default LoginPage;
