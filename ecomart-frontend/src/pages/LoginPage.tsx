import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { LogIn, Lock, Mail, Eye, EyeOff, RefreshCw, Leaf } from 'lucide-react';
import { authApi } from '../services/authApi';
import { useAuth } from '../providers/AuthProvider';
import { useToast } from '../context/ToastContext';
import OtpVerificationModal from '../components/auth/OtpVerificationModal';
import { AuthResponse, CustomAxiosError } from '../types';
import { loadFacebookScript } from '../services/socialAuth';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSocialSubmitting, setIsSocialSubmitting] = useState<boolean>(false);
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [socialConfig, setSocialConfig] = useState<{ googleClientId?: string; facebookAppId?: string }>({});

  const { login, isAuthenticated, isLoading, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Guard: nếu đã đăng nhập rồi thì redirect đúng trang theo role
  if (!isLoading && isAuthenticated && user) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === 'MANAGER') {
      return <Navigate to="/manager" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Tự động nạp cấu hình Social Client IDs từ Backend
  React.useEffect(() => {
    authApi.getSocialConfig()
      .then((res) => {
        if (res.data) {
          setSocialConfig(res.data);
        }
      })
      .catch(() => {
        // Fallback im lặng nếu chưa lấy được cấu hình
      });
  }, []);

  // Xử lý gửi token lên Backend để xác thực đăng nhập
  const handleProcessSocialLogin = async (provider: 'GOOGLE' | 'FACEBOOK', token: string): Promise<void> => {
    try {
      setIsSocialSubmitting(true);
      const apiRes = await authApi.socialLogin({
        provider,
        token,
      });
      const authData = apiRes.data;
      login(authData);
      showToast(`Chào mừng trở lại, ${authData.user.fullName}!`, 'success');
      navigate(authData.user.role === 'ADMIN' ? '/admin' : authData.user.role === 'MANAGER' ? '/manager' : '/');
    } catch (err: unknown) {
      const customError = err as CustomAxiosError;
      showToast(customError.response?.data?.message || `Đăng nhập ${provider} thất bại.`, 'error');
    } finally {
      setIsSocialSubmitting(false);
    }
  };

  // Bắt token trả về từ Google hoặc Facebook Dialog (nếu đang ở trong cửa sổ Popup hoặc Redirect)
  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const googleIdToken = params.get('id_token');
      const fbAccessToken = params.get('access_token');

      if (googleIdToken) {
        if (window.opener) {
          window.opener.postMessage(
            { type: 'GOOGLE_AUTH_SUCCESS', token: googleIdToken },
            window.location.origin
          );
          window.close();
        } else {
          window.history.replaceState(null, '', window.location.pathname);
          handleProcessSocialLogin('GOOGLE', googleIdToken);
        }
      } else if (fbAccessToken) {
        if (window.opener) {
          window.opener.postMessage(
            { type: 'FACEBOOK_AUTH_SUCCESS', token: fbAccessToken },
            window.location.origin
          );
          window.close();
        } else {
          window.history.replaceState(null, '', window.location.pathname);
          handleProcessSocialLogin('FACEBOOK', fbAccessToken);
        }
      }
    }
  }, []);

  // Lắng nghe sự kiện đăng nhập thành công từ cửa sổ Popup
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data.token) {
        handleProcessSocialLogin('GOOGLE', event.data.token);
      }
      if (event.data?.type === 'FACEBOOK_AUTH_SUCCESS' && event.data.token) {
        handleProcessSocialLogin('FACEBOOK', event.data.token);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleGoogleLogin = (): void => {
    const clientId = socialConfig.googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      showToast(
        'Chưa cấu hình Google Client ID trên hệ thống (biến môi trường clientIdGoogle trên máy).',
        'warning'
      );
      return;
    }

    const redirectUri = window.location.origin + '/login';
    const nonce = Math.random().toString(36).substring(2, 15);
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token%20id_token&scope=openid%20email%20profile&nonce=${nonce}`;

    const width = 550;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      googleAuthUrl,
      'GoogleLoginPopup',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );

    if (!popup) {
      showToast('Trình duyệt đã chặn cửa sổ popup. Vui lòng cho phép popup để đăng nhập Google.', 'warning');
    }
  };

  const handleFacebookLogin = async (): Promise<void> => {
    const appId = socialConfig.facebookAppId || import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!appId) {
      showToast(
        'Chưa cấu hình Facebook App ID trên hệ thống (biến môi trường clientIdFacebook trên máy).',
        'warning'
      );
      return;
    }

    try {
      setIsSocialSubmitting(true);
      await loadFacebookScript(appId);

      if (!window.FB) {
        throw new Error('Facebook SDK chưa sẵn sàng');
      }

      window.FB.login(
        (response) => {
          if (response.authResponse?.accessToken) {
            handleProcessSocialLogin('FACEBOOK', response.authResponse.accessToken);
          } else {
            setIsSocialSubmitting(false);
          }
        },
        { scope: 'email,public_profile' }
      );
    } catch (err) {
      setIsSocialSubmitting(false);
      showToast('Không thể kết nối Facebook SDK. Vui lòng thử lại.', 'error');
    }
  };

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
      } else if (authData.user.role === 'MANAGER') {
        navigate('/manager');
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
    } else if (authData.user.role === 'MANAGER') {
      navigate('/manager');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row min-h-[580px]">
        {/* Left Side Banner (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 p-10 text-white flex-col justify-between overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000"
            alt="EcoMart Living"
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
              🌱 Sàn TMĐT Sinh Thái Hàng Đầu
            </div>
          </div>

          {/* Middle Quote & Badges */}
          <div className="relative z-10 space-y-6 my-auto">
            <div className="space-y-3">
              <h2 className="text-3xl font-black leading-tight text-white">
                Tiêu Dùng Bền Vững <br />
                <span className="text-emerald-400">Cho Tương Lai Xanh</span>
              </h2>
              <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed max-w-sm">
                Tham gia cùng hơn 15.000+ gia đình sống xanh. Khám phá các sản phẩm đạt chuẩn Eco-Score 5★ minh bạch.
              </p>
            </div>

            {/* Glassmorphism Feature Chips */}
            <div className="space-y-2.5 pt-2">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-md flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                  ★
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">Minh Bạch Eco-Score 1-5★</p>
                  <p className="text-emerald-200 text-[11px]">Thẩm định tiêu chuẩn sinh thái rõ ràng</p>
                </div>
              </div>

              <div className="p-3 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-md flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
                  ♻️
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">Đóng Gói 0% Nhựa Nguyên Sinh</p>
                  <p className="text-emerald-200 text-[11px]">100% vật liệu phân hủy sinh học</p>
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
              Đăng Nhập
            </h1>
            <p className="text-xs text-slate-500">
              Chào mừng bạn trở lại! Đăng nhập để tiếp tục trải nghiệm mua sắm xanh.
            </p>
          </div>

          {/* Form Đăng nhập */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Mật khẩu
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
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
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
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
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập</span>
                </>
              )}
            </button>
          </form>

          {/* Divider Hoặc */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-400 font-bold uppercase tracking-wider">
              Hoặc đăng nhập bằng
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Nút Đăng nhập Google & Facebook */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSocialSubmitting}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={isSocialSubmitting}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>

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
