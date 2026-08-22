import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, X, RefreshCw, AlertCircle } from 'lucide-react';
import OtpInput from './OtpInput';
import { authApi } from '../../services/authApi';
import { useToast } from '../../context/ToastContext';
import { AuthResponse, CustomAxiosError } from '../../types';

export interface OtpVerificationModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onSuccess: (data: AuthResponse) => void;
}

/**
 * Modal popup xác thực mã OTP 6 số kích hoạt tài khoản qua Email
 */
export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  email,
  onClose,
  onSuccess,
}) => {
  const [otp, setOtp] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(60);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { showToast } = useToast();
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Thiết lập bộ đếm thời gian Cooldown 60s khi mở Modal
  useEffect(() => {
    if (!isOpen) {
      setOtp('');
      setErrorMessage('');
      setCountdown(60);
      return;
    }

    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleVerify = async (e?: React.FormEvent): Promise<void> => {
    if (e) {
      e.preventDefault();
    }

    if (otp.length !== 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số OTP');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await authApi.verifyEmail({
        email,
        otpCode: otp,
      });

      if (!isMountedRef.current) {
        return;
      }

      showToast('Kích hoạt tài khoản thành công!', 'success');
      onSuccess(response.data);
    } catch (error: unknown) {
      if (!isMountedRef.current) {
        return;
      }

      const customError = error as CustomAxiosError;
      const message =
        customError.response?.data?.message ||
        'Mã OTP không chính xác hoặc đã hết hạn.';

      setErrorMessage(message);
      showToast(message, 'error');
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  const handleResend = async (): Promise<void> => {
    if (countdown > 0 || isResending) {
      return;
    }

    setIsResending(true);
    setErrorMessage('');

    try {
      await authApi.resendOtp({ email });

      if (!isMountedRef.current) {
        return;
      }

      setCountdown(60);
      showToast('Mã OTP mới đã được gửi tới email của bạn!', 'success');
    } catch (error: unknown) {
      if (!isMountedRef.current) {
        return;
      }

      const customError = error as CustomAxiosError;
      const message =
        customError.response?.data?.message || 'Không thể gửi lại mã OTP.';

      // Xử lý lỗi 429 Rate Limit Cooldown thông minh
      if (customError.response?.status === 429) {
        const match = message.match(/(\d+)/);
        if (match && match[1]) {
          setCountdown(Number(match[1]));
        }
      }

      setErrorMessage(message);
      showToast(message, 'warning');
    } finally {
      if (isMountedRef.current) {
        setIsResending(false);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 relative border border-gray-100 animate-scale-up">
        {/* Nút đóng modal */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all disabled:opacity-50"
          aria-label="Đóng cửa sổ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Tiêu đề */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2
            id="modal-title"
            className="text-2xl font-black text-slate-900 tracking-tight"
          >
            Xác Thực Tài Khoản
          </h2>
          <p className="text-sm text-slate-500">
            Mã OTP 6 chữ số đã được gửi đến email:
          </p>
          <p className="text-sm font-semibold text-emerald-700 bg-emerald-50/80 py-1 px-3 rounded-lg inline-block break-all">
            {email}
          </p>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div
            className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form nhập OTP */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="py-2">
            <OtpInput
              value={otp}
              onChange={(val) => {
                setOtp(val);
                if (errorMessage) {
                  setErrorMessage('');
                }
              }}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang kiểm tra...</span>
              </>
            ) : (
              'Xác Nhận Kích Hoạt'
            )}
          </button>
        </form>

        {/* Bộ đếm gửi lại mã */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5">
          <span>Chưa nhận được mã?</span>
          {countdown > 0 ? (
            <span className="font-semibold text-emerald-600">
              Gửi lại sau ({countdown}s)
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || isSubmitting}
              className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline disabled:opacity-50"
            >
              {isResending ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationModal;
