import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Lock, Mail, User as UserIcon, Phone, Eye, EyeOff, RefreshCw, Leaf } from 'lucide-react';
import { authApi } from '../services/authApi';
import { useAuth } from '../providers/AuthProvider';
import { useToast } from '../context/ToastContext';
import OtpVerificationModal from '../components/auth/OtpVerificationModal';
import { AuthResponse, CustomAxiosError } from '../types';

interface FormErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
}

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Định dạng email không hợp lệ';
    }

    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!phoneRegex.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ (VD: 0912345678)';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có tối thiểu 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận lại mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Xóa thông báo lỗi khi người dùng gõ
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
      });

      showToast('Đăng ký thành công! Vui lòng nhập mã OTP để kích hoạt.', 'success');
      setShowOtpModal(true);
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      const message = customError.response?.data?.message || 'Đăng ký thất bại. Email có thể đã tồn tại.';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSuccess = (authData: AuthResponse): void => {
    setShowOtpModal(false);
    login(authData);
    navigate('/');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row min-h-[620px]">
        {/* Left Side Banner (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 p-10 text-white flex-col justify-between overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=1000"
            alt="EcoMart Community"
            className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/40 to-transparent" />

          {/* Top Logo & Tag */}
          <div className="relative z-10 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/50">
                <Leaf className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Eco<span className="text-emerald-400">Mart</span>
              </span>
            </Link>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md border border-emerald-700/60">
              🌱 Gia Nhập Cộng Đồng Sống Xanh
            </div>
          </div>

          {/* Middle Quote & Badges */}
          <div className="relative z-10 space-y-6 my-auto">
            <div className="space-y-3">
              <h2 className="text-3xl font-black leading-tight text-white">
                Bắt Đầu Hành Trình <br />
                <span className="text-emerald-400">Tiêu Dùng Sinh Thái</span>
              </h2>
              <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed max-w-sm">
                Tạo tài khoản ngay hôm nay để nhận tích điểm Eco-Points, ưu đãi hữu cơ và đồng hành trồng rừng cùng EcoMart.
              </p>
            </div>

            {/* Glassmorphism Feature Chips */}
            <div className="space-y-2.5 pt-2">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-md flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                  🎁
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">Tích Điểm Eco-Points</p>
                  <p className="text-emerald-200 text-[11px]">Đổi quà tặng & ưu đãi xanh hấp dẫn</p>
                </div>
              </div>

              <div className="p-3 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-md flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                  🔒
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">Xác Thực OTP An Toàn</p>
                  <p className="text-emerald-200 text-[11px]">Bảo mật thông tin tài khoản tuyệt đối</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer note */}
          <div className="relative z-10 pt-4 border-t border-emerald-800/60 text-[11px] text-emerald-200/80">
            © EcoMart Co., Ltd. Tất cả quyền được bảo lưu.
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-10 flex flex-col justify-center space-y-6">
          {/* Header Branding (Mobile) */}
          <div className="text-center lg:text-left space-y-2">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 shadow-sm lg:hidden mb-2">
              <Leaf className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tạo Tài Khoản
            </h1>
            <p className="text-xs text-slate-500">
              Điền thông tin bên dưới để trở thành thành viên EcoMart.
            </p>
          </div>

          {/* Form Đăng Ký */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Họ và Tên</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-rose-500 font-semibold pl-1">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Địa chỉ Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 font-semibold pl-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Số Điện Thoại</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  placeholder="0912345678"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-xs text-rose-500 font-semibold pl-1">{errors.phoneNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
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
                {errors.password && (
                  <p className="text-xs text-rose-500 font-semibold pl-1">{errors.password}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-500 font-semibold pl-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-3 cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang tạo tài khoản...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Đăng Ký Tài Khoản</span>
                </>
              )}
            </button>
          </form>

          {/* Footer chuyển sang login */}
          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>

      {/* Modal xác thực mã OTP qua Email */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        email={formData.email}
        onClose={() => setShowOtpModal(false)}
        onSuccess={handleOtpSuccess}
      />
    </div>
  );
};

export default RegisterPage;
