import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Package,
  ShoppingBag,
  Loader2,
  Calendar,
  CreditCard,
  Building,
  RotateCcw,
  Home,
} from 'lucide-react';
import { paymentApi } from '../services/paymentApi';
import { VNPayReturnResponse, CustomAxiosError } from '../types';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

// Helper chuyển đổi định dạng ngày VNPay (YYYYMMDDHHmmss -> DD/MM/YYYY HH:mm:ss)
const parseVNPayDate = (dateStr?: string): string => {
  if (!dateStr || dateStr.length < 14) {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date());
  }
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  const hour = dateStr.substring(8, 10);
  const minute = dateStr.substring(10, 12);
  const second = dateStr.substring(12, 14);
  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
};

export const VNPayReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [result, setResult] = useState<VNPayReturnResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parse directly from URL search params for fallback / instant render
  const vnpResponseCode = searchParams.get('vnp_ResponseCode') || '';
  const vnpTxnRef = searchParams.get('vnp_TxnRef') || '';
  const rawAmount = searchParams.get('vnp_Amount');
  const vnpAmount = rawAmount ? Math.floor(parseInt(rawAmount, 10) / 100) : 0;
  const vnpBankCode = searchParams.get('vnp_BankCode') || 'VNPay Gateway';
  const vnpPayDate = searchParams.get('vnp_PayDate') || '';
  const vnpOrderInfo = searchParams.get('vnp_OrderInfo') || '';

  const isSuccess = useMemo(() => {
    if (result) return result.isSuccess;
    return vnpResponseCode === '00';
  }, [result, vnpResponseCode]);

  useEffect(() => {
    const verifyPayment = async () => {
      setIsLoading(true);
      setErrorMsg(null);

      const paramsObj: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        paramsObj[key] = value;
      });

      if (Object.keys(paramsObj).length === 0) {
        setErrorMsg('Không tìm thấy thông tin giao dịch trả về từ VNPay.');
        setIsLoading(false);
        return;
      }

      try {
        const res = await paymentApi.getVNPayReturn(paramsObj);
        if (res.success && res.data) {
          setResult(res.data);
        } else {
          setErrorMsg(res.message || 'Không thể xác thực giao dịch.');
        }
      } catch (err: unknown) {
        const customError = err as CustomAxiosError;
        setErrorMsg(
          customError.response?.data?.message || 'Có lỗi xảy ra khi xác thực kết quả thanh toán.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 py-16">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
        <h2 className="text-lg font-bold text-slate-800">Đang xác thực giao dịch VNPay...</h2>
        <p className="text-xs text-slate-500">Vui lòng không đóng trình duyệt trong giây lát.</p>
      </div>
    );
  }

  const effectiveOrderCode = result?.orderCode || vnpOrderInfo || vnpTxnRef;
  const effectiveAmount = result?.amount || vnpAmount;
  const effectiveTransactionNo = result?.transactionNo || vnpTxnRef;
  const effectiveBankCode = result?.bankCode || vnpBankCode;
  const effectivePayDate = result?.payDate ? parseVNPayDate(result.payDate) : parseVNPayDate(vnpPayDate);

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="bg-white border border-gray-200/80 rounded-3xl p-8 shadow-sm text-center space-y-6">
        {/* Status Icon */}
        <div className="flex justify-center">
          {isSuccess ? (
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/20">
              <XCircle className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">
            {isSuccess ? 'Thanh Toán Thành Công!' : 'Thanh Toán Không Thành Công'}
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {isSuccess
              ? 'Giao dịch của bạn qua cổng thanh toán VNPay đã được xử lý và xác thực thành công.'
              : errorMsg ||
                result?.message ||
                'Giao dịch không thành công hoặc bị hủy.'}
          </p>
        </div>

        {/* Receipt Card */}
        <div className="bg-slate-50/80 rounded-2xl p-5 border border-gray-100 text-left space-y-3 text-xs">
          <div className="flex items-center justify-between border-b pb-2.5 border-gray-200/60 font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Chi Tiết Giao Dịch VNPay
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isSuccess ? 'GIAO DỊCH THÀNH CÔNG' : 'GIAO DỊCH THẤT BẠI'}
            </span>
          </div>

          <div className="space-y-2 text-slate-600">
            {effectiveOrderCode && (
              <div className="flex justify-between">
                <span>Mã đơn / Nội dung:</span>
                <strong className="text-slate-900 font-mono">{effectiveOrderCode}</strong>
              </div>
            )}

            {effectiveTransactionNo && (
              <div className="flex justify-between">
                <span>Mã GD VNPay:</span>
                <span className="font-mono text-slate-800 font-semibold">
                  {effectiveTransactionNo}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Ngân hàng:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {effectiveBankCode}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Số tiền:</span>
              <strong className="text-sm font-black text-emerald-600">
                {formatCurrency(effectiveAmount)}
              </strong>
            </div>

            <div className="flex justify-between items-center">
              <span>Thời gian:</span>
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {effectivePayDate}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isSuccess ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/orders"
              tabIndex={0}
              aria-label="Xem chi tiết đơn hàng"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/20 transition-all"
            >
              <Package className="w-4 h-4" />
              <span>Xem Chi Tiết Đơn Hàng</span>
            </Link>

            <Link
              to="/products"
              tabIndex={0}
              aria-label="Tiếp tục mua sắm"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl border border-gray-200 shadow-sm transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Tiếp Tục Mua Sắm</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              tabIndex={0}
              aria-label="Thử thanh toán lại tại giỏ hàng"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/20 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thử Thanh Toán Lại</span>
            </button>

            <Link
              to="/"
              tabIndex={0}
              aria-label="Quay về trang chủ"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl border border-gray-200 shadow-sm transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Về Trang Chủ</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VNPayReturnPage;
