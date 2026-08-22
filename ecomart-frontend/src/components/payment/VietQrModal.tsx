import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { orderApi } from '../../services/orderApi';
import { useToast } from '../../context/ToastContext';

export interface VietQrModalProps {
  isOpen: boolean;
  orderCode: string;
  orderId: number;
  amount: number;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const VietQrModal: React.FC<VietQrModalProps> = ({
  isOpen,
  orderCode,
  orderId,
  amount,
  onClose,
  onPaymentSuccess,
}) => {
  const { showToast } = useToast();

  // 15-minute countdown (900 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(900);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // Polling ref to prevent memory leak
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // VietQR parameters
  const bankName = 'VietinBank — Chi nhánh TP. Hồ Chí Minh';
  const accountNumber = '109876543210';
  const accountHolder = 'CONG TY CO PHAN ECOMART VIET NAM';
  const qrUrl = `https://img.vietqr.io/image/970415-109876543210-compact2.png?amount=${amount}&addInfo=${orderCode}`;

  const formatCurrency = (val: number): string =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  // Format timer MM:SS
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, fieldName: string): void => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      showToast(`Đã sao chép ${fieldName}`, 'success');
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    }
  };

  // Check payment status manually
  const checkPaymentStatus = useCallback(async (): Promise<boolean> => {
    if (!orderId) return false;
    try {
      setIsChecking(true);
      const res = await orderApi.getOrderDetail(orderId);
      if (res.data && res.data.paymentStatus === 'PAID') {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setIsSuccess(true);
        setTimeout(() => {
          onPaymentSuccess();
        }, 1500);
        return true;
      }
    } catch (error) {
      console.error('Error polling payment status:', error);
    } finally {
      setIsChecking(false);
    }
    return false;
  }, [orderId, onPaymentSuccess]);

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(900);
    setIsSuccess(false);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (pollingRef.current) clearInterval(pollingRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen]);

  // Auto-polling effect (every 3 seconds)
  useEffect(() => {
    if (!isOpen || isSuccess || timeLeft === 0 || !orderId) return;

    pollingRef.current = setInterval(() => {
      checkPaymentStatus();
    }, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isOpen, isSuccess, timeLeft, orderId, checkPaymentStatus]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vietqr-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 id="vietqr-modal-title" className="text-base font-bold text-slate-900">
                Thanh Toán Chuyển Khoản SePay VietQR
              </h3>
              <p className="text-xs text-slate-500">Mã đơn hàng: #{orderCode}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            tabIndex={0}
            aria-label="Đóng cửa sổ thanh toán"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Success Notification Banner */}
          {isSuccess ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-in zoom-in-95">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-black text-emerald-900">
                  Thanh Toán Thành Công!
                </h4>
                <p className="text-xs text-emerald-700 mt-1">
                  EcoMart đã nhận được tiền chuyển khoản cho đơn hàng #{orderCode}. Đang chuyển hướng...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Countdown Timer Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                <div className="flex items-center gap-2 text-xs text-emerald-900 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Quét mã qua ứng dụng ngân hàng bất kỳ (Napas 247)</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-emerald-200 shadow-sm text-xs font-mono font-bold">
                  <Clock className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span className={timeLeft < 180 ? 'text-rose-600' : 'text-emerald-700'}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              {timeLeft === 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-rose-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Đã hết thời gian thanh toán. Vui lòng thử lại tại trang Chi Tiết Đơn Hàng.</span>
                </div>
              )}

              {/* QR Code & Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* QR Image Column (5 cols) */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 border border-gray-100 rounded-2xl space-y-2.5">
                  <div className="bg-white p-2.5 rounded-2xl shadow-md border border-gray-200/80">
                    <img
                      src={qrUrl}
                      alt={`Mã VietQR thanh toán cho đơn hàng ${orderCode}`}
                      className="w-48 h-48 object-contain rounded-xl"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 text-center font-medium">
                    Mở app Ngân hàng &gt; Chọn <strong>Quét mã QR</strong>
                  </p>
                </div>

                {/* Information Details Column (7 cols) */}
                <div className="md:col-span-7 space-y-3 text-xs">
                  {/* Bank */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                    <div className="text-slate-400 font-medium">Ngân hàng thụ hưởng</div>
                    <div className="font-bold text-slate-900 mt-0.5">{bankName}</div>
                  </div>

                  {/* Account Number */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-slate-400 font-medium">Số tài khoản</div>
                      <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                        {accountNumber}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(accountNumber, 'Số tài khoản')}
                      tabIndex={0}
                      aria-label="Sao chép số tài khoản"
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                    >
                      {copiedField === 'Số tài khoản' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[11px] text-emerald-600 font-bold">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Account Name */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                    <div className="text-slate-400 font-medium">Chủ tài khoản</div>
                    <div className="font-bold text-slate-900 mt-0.5 uppercase tracking-wide">
                      {accountHolder}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-slate-400 font-medium">Số tiền thanh toán</div>
                      <div className="font-black text-emerald-600 text-base mt-0.5">
                        {formatCurrency(amount)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(amount.toString(), 'Số tiền')}
                      tabIndex={0}
                      aria-label="Sao chép số tiền"
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                    >
                      {copiedField === 'Số tiền' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[11px] text-emerald-600 font-bold">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Transfer Content */}
                  <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-rose-600 font-bold flex items-center gap-1">
                        <span>Nội dung chuyển khoản</span>
                        <span className="text-[10px] bg-rose-200 text-rose-800 px-1.5 py-0.2 rounded font-black">
                          BẮT BUỘC
                        </span>
                      </div>
                      <div className="font-mono font-black text-rose-700 text-sm mt-0.5 tracking-wider">
                        {orderCode}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(orderCode, 'Nội dung chuyển khoản')}
                      tabIndex={0}
                      aria-label="Sao chép nội dung chuyển khoản"
                      className="px-2.5 py-1.5 bg-white hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition-colors flex items-center gap-1 shadow-sm"
                    >
                      {copiedField === 'Nội dung chuyển khoản' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[11px] text-emerald-600">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Instruction Note */}
              <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-2xl text-[11px] text-amber-800 leading-relaxed">
                💡 <strong>Lưu ý:</strong> Vui lòng giữ nguyên <strong>Nội dung chuyển khoản</strong> để hệ thống tự động gạch nợ và xác nhận đơn hàng của bạn trong vòng vài giây.
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            tabIndex={0}
            aria-label="Đóng cửa sổ thanh toán"
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Đóng
          </button>

          {!isSuccess && timeLeft > 0 && (
            <button
              type="button"
              onClick={checkPaymentStatus}
              disabled={isChecking}
              tabIndex={0}
              aria-label="Kiểm tra trạng thái thanh toán"
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang kiểm tra...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tôi Đã Chuyển Khoản</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VietQrModal;
