import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Building,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { paymentApi } from '../services/paymentApi';
import { orderApi } from '../services/orderApi';
import { useToast } from '../context/ToastContext';

export const VNPayMockPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const rawOrderId = searchParams.get('orderId');
  const rawOrderCode = searchParams.get('orderCode') || '';
  const rawAmount = searchParams.get('amount');

  const [orderId] = useState<number | null>(rawOrderId ? Number(rawOrderId) : null);
  const [orderCode, setOrderCode] = useState<string>(rawOrderCode);
  const [amount, setAmount] = useState<number>(rawAmount ? Number(rawAmount) : 0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingOrder, setIsLoadingOrder] = useState<boolean>(false);

  useEffect(() => {
    if (orderId && amount <= 0) {
      setIsLoadingOrder(true);
      orderApi
        .getOrderDetail(orderId)
        .then((res) => {
          if (res.data) {
            setOrderCode(res.data.orderCode);
            setAmount(res.data.totalAmount);
          }
        })
        .catch(() => {
          showToast('Không tìm thấy thông tin đơn hàng.', 'error');
        })
        .finally(() => {
          setIsLoadingOrder(false);
        });
    }
  }, [orderId, amount, showToast]);

  const formatCurrency = (val: number): string =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const handleSuccessPayment = async (): Promise<void> => {
    setIsProcessing(true);
    try {
      if (orderId || orderCode) {
        await paymentApi.mockPaymentSuccess({
          orderId: orderId ?? undefined,
          orderCode: orderCode || undefined,
          gateway: 'VNPAY',
        });
      }

      const params = new URLSearchParams({
        vnp_ResponseCode: '00',
        vnp_TxnRef: orderCode || (orderId ? `EM-ORD-${orderId}` : 'MOCK-TXN'),
        vnp_Amount: (amount * 100).toString(),
        vnp_OrderInfo: `Thanh toan don hang ${orderCode}`,
        vnp_TransactionNo: `VNP${Date.now().toString().slice(-8)}`,
        vnp_BankCode: 'NCB',
        vnp_PayDate: new Date().toISOString(),
      });

      showToast('Xác nhận thanh toán thành công!', 'success');
      navigate(`/payment/vnpay/return?${params.toString()}`);
    } catch {
      showToast('Lỗi xử lý thanh toán giả lập.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPayment = (): void => {
    const params = new URLSearchParams({
      vnp_ResponseCode: '24',
      vnp_TxnRef: orderCode || (orderId ? `EM-ORD-${orderId}` : 'MOCK-TXN'),
      vnp_Amount: (amount * 100).toString(),
      vnp_OrderInfo: 'Khách hàng hủy giao dịch tại cổng thanh toán',
    });
    showToast('Đã hủy giao dịch thanh toán.', 'warning');
    navigate(`/payment/vnpay/return?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-emerald-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* VNPay Mock Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 p-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl mb-3 border border-white/20 shadow-inner">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight">CỔNG THANH TOÁN VNPAY</h1>
          <p className="text-xs text-blue-100 font-semibold mt-0.5 uppercase tracking-wider">
            Chế độ Giả lập Thử nghiệm (Sandbox Simulation)
          </p>
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-400/20 border border-amber-300/40 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3 text-amber-300" />
            <span>MOCK MODE</span>
          </div>
        </div>

        {/* Notice Badge */}
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-2.5 flex items-center gap-2 text-amber-800 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Môi trường giả lập: Bạn không bị trừ tiền thật trong tài khoản.</span>
        </div>

        {/* Body Details */}
        <div className="p-6 sm:p-8 space-y-6">
          {isLoadingOrder ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs font-medium">Đang tải thông tin đơn hàng...</span>
            </div>
          ) : (
            <>
              {/* Amount Highlight Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-gray-100 text-center space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Số Tiền Cần Thanh Toán
                </span>
                <p className="text-3xl font-black text-blue-700 font-mono">
                  {formatCurrency(amount)}
                </p>
              </div>

              {/* Order Metadata Table */}
              <div className="divide-y divide-gray-100 text-xs border border-gray-100 rounded-2xl overflow-hidden">
                <div className="p-3.5 flex justify-between items-center bg-slate-50/50">
                  <span className="text-slate-500 font-medium">Đơn vị thụ hưởng:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    CÔNG TY CỔ PHẦN ECOMART VIỆT NAM
                  </span>
                </div>
                <div className="p-3.5 flex justify-between items-center bg-white">
                  <span className="text-slate-500 font-medium">Mã đơn hàng:</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                    {orderCode || `#ORD-${orderId}`}
                  </span>
                </div>
                <div className="p-3.5 flex justify-between items-center bg-slate-50/50">
                  <span className="text-slate-500 font-medium">Nội dung thanh toán:</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[200px]">
                    Thanh toan don hang {orderCode}
                  </span>
                </div>
                <div className="p-3.5 flex justify-between items-center bg-white">
                  <span className="text-slate-500 font-medium">Cổng giao dịch:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    VNPay Mock Payment Gateway 256-bit
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleSuccessPayment}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang xử lý giao dịch...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>XÁC NHẬN THANH TOÁN THÀNH CÔNG (MÃ 00)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancelPayment}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Hủy giao dịch / Giả lập thất bại (Mã 24)</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VNPayMockPage;
