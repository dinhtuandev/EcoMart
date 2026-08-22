import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Package,
  ArrowRight,
  Loader2,
  Calendar,
  CreditCard,
  Building,
} from 'lucide-react';
import { paymentApi } from '../services/paymentApi';
import { VNPayReturnResponse } from '../types';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

export const VNPayReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [result, setResult] = useState<VNPayReturnResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      } catch (err: any) {
        setErrorMsg(
          err.response?.data?.message || 'Có lỗi xảy ra khi xác thực kết quả thanh toán.'
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

  const isSuccess = result?.isSuccess ?? false;

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="bg-white border border-gray-200/80 rounded-3xl p-8 shadow-sm text-center space-y-6">
        {/* Status Icon */}
        <div className="flex justify-center">
          {isSuccess ? (
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
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
                'Giao dịch không thể hoàn tất do bị hủy bỏ hoặc có lỗi xảy ra.'}
          </p>
        </div>

        {/* Transaction Details */}
        {result && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Mã đơn hàng:</span>
              <span className="font-extrabold text-slate-900">#{result.orderCode}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Số tiền:</span>
              <span className="font-extrabold text-emerald-600 text-sm">
                {formatCurrency(result.amount)}
              </span>
            </div>
            {result.bankCode && (
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> Ngân hàng:
                </span>
                <span className="font-bold text-slate-800">{result.bankCode}</span>
              </div>
            )}
            {result.transactionNo && (
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Mã giao dịch VNPay:
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {result.transactionNo}
                </span>
              </div>
            )}
            {result.payDate && (
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Thời gian:
                </span>
                <span className="font-medium text-slate-700">{result.payDate}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/orders"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            Xem Danh Sách Đơn Hàng
          </Link>
          <Link
            to="/products"
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Tiếp Tục Mua Sắm
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VNPayReturnPage;
