import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  X,
  ChevronDown,
  Truck,
  Copy,
  Check,
} from 'lucide-react';
import { orderApi } from '../../services/orderApi';
import { useToast } from '../../context/ToastContext';
import { Order, OrderStatus, PaymentStatus, CustomAxiosError } from '../../types';
import { ShippingTrackingModal } from '../../components/shipping/ShippingTrackingModal';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr));
};

const getPaymentMethodLabel = (method: string): string =>
  ({ COD: 'COD - Nhận hàng thanh toán', VNPAY: 'VNPay', SEPAY: 'SePay VietQR' })[method] ?? method;

const PAYMENT_STATUS_OPTS: { value: PaymentStatus; label: string }[] = [
  { value: 'UNPAID', label: 'Chưa thanh toán' },
  { value: 'PAID', label: 'Đã thanh toán' },
  { value: 'FAILED', label: 'Thanh toán thất bại' },
  { value: 'REFUNDED', label: 'Đã hoàn tiền' },
];

const getPaymentStatusConfig = (status: string): { label: string; color: string } => {
  const map: Record<string, { label: string; color: string }> = {
    UNPAID: { label: 'Chưa thanh toán', color: 'bg-amber-100 text-amber-700' },
    PAID: { label: 'Đã thanh toán', color: 'bg-emerald-100 text-emerald-700' },
    FAILED: { label: 'Thanh toán thất bại', color: 'bg-rose-100 text-rose-700' },
    REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-blue-100 text-blue-700' },
  };
  return map[status] ?? { label: status, color: 'bg-slate-100 text-slate-700' };
};

const getShippingStatusConfig = (status?: string): { label: string; color: string } => {
  switch (status) {
    case 'READY_TO_PICK':
      return { label: 'Chờ lấy hàng / Đóng gói', color: 'bg-amber-100 text-amber-800' };
    case 'PICKING':
      return { label: 'Bưu tá đang lấy hàng', color: 'bg-indigo-100 text-indigo-800' };
    case 'DELIVERING':
      return { label: 'Đang vận chuyển', color: 'bg-blue-100 text-blue-800' };
    case 'ARRIVED_AT_LOCAL_HUB':
      return { label: 'Đến bưu cục phát (Giao 24h)', color: 'bg-purple-100 text-purple-800' };
    case 'DELIVERED':
      return { label: 'Giao thành công', color: 'bg-emerald-100 text-emerald-800' };
    case 'FAILED':
      return { label: 'Giao thất bại', color: 'bg-rose-100 text-rose-800' };
    case 'RETURNED':
      return { label: 'Đã hoàn trả', color: 'bg-slate-100 text-slate-800' };
    default:
      return { label: status || 'Chờ điều phối', color: 'bg-slate-100 text-slate-700' };
  }
};


// Timeline
const TIMELINE_STEPS: { key: OrderStatus; label: string; icon: React.ReactNode; tsKey: keyof Order }[] = [
  { key: 'PENDING', label: 'Đặt Hàng', icon: <Clock className="w-4 h-4" />, tsKey: 'orderedAt' },
  { key: 'CONFIRMED', label: 'Xác Nhận', icon: <CheckCircle2 className="w-4 h-4" />, tsKey: 'confirmedAt' },
  { key: 'COMPLETED', label: 'Hoàn Thành', icon: <Package className="w-4 h-4" />, tsKey: 'completedAt' },
];
const STATUS_ORDER: OrderStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED'];

// Cancel Modal
interface CancelModalProps {
  orderCode: string;
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
}
const CancelModal: React.FC<CancelModalProps> = ({ orderCode, onConfirm, onClose }) => {
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!reason.trim()) return;
    setIsSubmitting(true);
    await onConfirm(reason.trim());
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Hủy đơn hàng #{orderCode}</h2>
          <button type="button" onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">Thao tác này sẽ hủy đơn và hoàn tồn kho. Không thể hoàn tác.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Lý do hủy <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do hủy đơn hàng..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">
              Không hủy
            </button>
            <button
              type="submit"
              disabled={!reason.trim() || isSubmitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
              Xác nhận hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ApprovePaymentModalProps {
  orderCode: string;
  totalAmount: number;
  paymentMethod: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

const ApprovePaymentModal: React.FC<ApprovePaymentModalProps> = ({
  orderCode,
  totalAmount,
  paymentMethod,
  onConfirm,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    await onConfirm();
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-teal-700">
            <CreditCard className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-wide">
              Đối Soát & Phê Duyệt Thanh Toán
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2 text-xs text-amber-900">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Cảnh Báo Nghiệp Vụ Đối Soát:</span>
          </div>
          <p className="leading-relaxed">
            Đơn hàng này được thiết lập thanh toán Online qua cổng{' '}
            <strong className="underline font-black">{paymentMethod}</strong> với số tiền{' '}
            <strong className="text-teal-800 font-black">{formatCurrency(totalAmount)}</strong>.
          </p>
          <p className="leading-relaxed text-[11px] text-amber-800/90">
            Bạn <strong>chỉ thực hiện duyệt thủ công</strong> khi đã kiểm tra sao kê tài khoản ngân hàng của EcoMart và chắc chắn nhận được tiền từ khách hàng (ví dụ: khách chuyển khoản trực tiếp nhưng ghi sai mã đơn hoặc lỗi webhook kết nối).
          </p>
        </div>

        <div className="text-xs bg-slate-50 p-3 rounded-xl space-y-1.5 border border-gray-100">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Mã đơn hàng:</span>
            <span className="font-mono font-bold text-slate-900">#{orderCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Số tiền cần khớp:</span>
            <span className="font-bold text-emerald-700 font-mono text-sm">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-teal-600/20 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
              Xác nhận đã nhận tiền & Duyệt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ManagerOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const backUrl = '/manager/orders';
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showApprovePaymentModal, setShowApprovePaymentModal] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [isApprovingPayment, setIsApprovingPayment] = useState<boolean>(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState<boolean>(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState<boolean>(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState<boolean>(false);
  const [hasCopiedTracking, setHasCopiedTracking] = useState<boolean>(false);

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setHasCopiedTracking(true);
    showToast('Đã sao chép mã vận đơn.', 'success');
    setTimeout(() => setHasCopiedTracking(false), 2000);
  };

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await orderApi.adminGetOrderDetail(Number(id));
      setOrder(res.data);
    } catch {
      showToast('Không tìm thấy đơn hàng.', 'error');
      navigate(backUrl);
    } finally {
      setIsLoading(false);
    }
  }, [backUrl, id, navigate, showToast]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleApprovePaymentConfirm = async (): Promise<void> => {
    if (!order) return;
    setIsApprovingPayment(true);
    try {
      const res = await orderApi.adminApprovePayment(order.id);
      setOrder(res.data);
      setShowApprovePaymentModal(false);
      showToast(
        'Đã duyệt thanh toán thành công (Trạng thái: ĐÃ THANH TOÁN). Vui lòng bấm "Xác Nhận Đơn" để giao hàng.',
        'success'
      );
    } catch (error: unknown) {
      const e = error as CustomAxiosError;
      showToast(e.response?.data?.message || 'Lỗi xác nhận thanh toán.', 'error');
    } finally {
      setIsApprovingPayment(false);
    }
  };

  const handleConfirm = async (): Promise<void> => {
    if (!order) return;
    setIsConfirming(true);
    try {
      const res = await orderApi.adminConfirmOrder(order.id);
      setOrder(res.data);
      showToast('Đã xác nhận đơn hàng thành công.', 'success');
    } catch (error: unknown) {
      const e = error as CustomAxiosError;
      showToast(e.response?.data?.message || 'Lỗi xác nhận đơn.', 'error');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleComplete = async (): Promise<void> => {
    if (!order) return;
    setIsCompleting(true);
    try {
      const res = await orderApi.adminCompleteOrder(order.id);
      setOrder(res.data);
      showToast('Đơn hàng đã được hoàn thành.', 'success');
    } catch (error: unknown) {
      const e = error as CustomAxiosError;
      showToast(e.response?.data?.message || 'Lỗi hoàn thành đơn.', 'error');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCancelConfirm = async (reason: string): Promise<void> => {
    if (!order) return;
    try {
      const res = await orderApi.adminCancelOrder(order.id, { cancellationReason: reason });
      setOrder(res.data);
      showToast('Đã hủy đơn hàng và hoàn tồn kho.', 'success');
      setShowCancelModal(false);
    } catch (error: unknown) {
      const e = error as CustomAxiosError;
      showToast(e.response?.data?.message || 'Lỗi hủy đơn.', 'error');
    }
  };

  const handleUpdatePaymentStatus = async (newStatus: PaymentStatus): Promise<void> => {
    if (!order) return;
    setIsUpdatingPayment(true);
    setShowPaymentDropdown(false);
    try {
      const res = await orderApi.adminUpdatePaymentStatus(order.id, { paymentStatus: newStatus });
      setOrder(res.data);
      showToast('Đã cập nhật trạng thái thanh toán.', 'success');
    } catch (error: unknown) {
      const e = error as CustomAxiosError;
      showToast(e.response?.data?.message || 'Lỗi cập nhật thanh toán.', 'error');
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!order) return null;

  const isCancelled = order.status === 'CANCELLED';
  const currentStepIndex = isCancelled ? -1 : STATUS_ORDER.indexOf(order.status);
  const paymentCfg = getPaymentStatusConfig(order.paymentStatus);

  return (
    <>
      {showCancelModal && (
        <CancelModal
          orderCode={order.orderCode}
          onConfirm={handleCancelConfirm}
          onClose={() => setShowCancelModal(false)}
        />
      )}

      {showApprovePaymentModal && (
        <ApprovePaymentModal
          orderCode={order.orderCode}
          totalAmount={order.totalAmount}
          paymentMethod={getPaymentMethodLabel(order.paymentMethod)}
          onConfirm={handleApprovePaymentConfirm}
          onClose={() => setShowApprovePaymentModal(false)}
        />
      )}

      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(backUrl)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Chi tiết đơn #{order.orderCode}
              </h1>
              <p className="text-xs text-slate-400">Đặt lúc: {formatDate(order.orderedAt)}</p>
            </div>
          </div>

          {/* Admin Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {order.paymentStatus === 'UNPAID' && order.status !== 'CANCELLED' && order.paymentMethod !== 'COD' && (
              <button
                type="button"
                onClick={() => setShowApprovePaymentModal(true)}
                disabled={isApprovingPayment}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white text-xs font-black rounded-xl shadow-md shadow-teal-600/20 disabled:opacity-50"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Đối Soát / Duyệt TT Thủ Công
              </button>
            )}
            {order.status === 'PENDING' && (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isConfirming}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl disabled:opacity-50"
              >
                {isConfirming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Xác Nhận Đơn
              </button>
            )}
            {order.status === 'CONFIRMED' && (
              <button
                type="button"
                onClick={handleComplete}
                disabled={isCompleting}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl disabled:opacity-50"
              >
                {isCompleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
                Hoàn Thành Đơn
              </button>
            )}
            {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-100"
              >
                <XCircle className="w-3.5 h-3.5" />
                Hủy Đơn
              </button>
            )}

            {/* Payment Status Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPaymentDropdown((v) => !v)}
                disabled={isUpdatingPayment}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-colors disabled:opacity-50 ${paymentCfg.color} border-current/20`}
              >
                {isUpdatingPayment ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5" />
                    {paymentCfg.label}
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
              {showPaymentDropdown && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1 overflow-hidden">
                  {PAYMENT_STATUS_OPTS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleUpdatePaymentStatus(opt.value)}
                      className={`w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 transition-colors ${
                        order.paymentStatus === opt.value ? 'text-emerald-700 bg-emerald-50' : 'text-slate-700'
                      }`}
                    >
                      {opt.label}
                      {order.paymentStatus === opt.value && ' ✓'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cancellation Reason */}
        {isCancelled && order.cancellationReason && (
          <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-rose-800">Đơn hàng đã bị hủy</p>
              <p className="text-xs text-rose-600 mt-0.5">Lý do: {order.cancellationReason}</p>
              {order.cancelledAt && (
                <p className="text-xs text-rose-400 mt-0.5">{formatDate(order.cancelledAt)}</p>
              )}
            </div>
          </div>
        )}

        {/* Order Timeline */}
        {!isCancelled && (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-5">Tiến Trình Đơn Hàng</h2>
            <div className="flex items-start">
              {TIMELINE_STEPS.map((step, index) => {
                const isDone = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const timestamp = order[step.tsKey] as string | undefined;
                const isLast = index === TIMELINE_STEPS.length - 1;

                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center">
                    <div className="flex items-center w-full">
                      {index > 0 && (
                        <div className={`flex-1 h-1 ${isDone ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                      )}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                            : 'bg-gray-100 text-gray-400'
                        } ${isCurrent ? 'ring-2 ring-emerald-300 ring-offset-2' : ''}`}
                      >
                        {step.icon}
                      </div>
                      {!isLast && (
                        <div className={`flex-1 h-1 ${index < currentStepIndex ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className="text-center mt-2 px-1">
                      <p className={`text-[11px] font-bold ${isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {step.label}
                      </p>
                      {timestamp && isDone && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(timestamp)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-sm font-bold text-slate-900">
                Sản Phẩm ({order.items?.length ?? 0} mặt hàng)
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items?.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-3">
                  {item.productImageUrl ? (
                    <img
                      src={item.productImageUrl}
                      alt={item.productName}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{item.productName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {formatCurrency(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 flex-shrink-0">
                    {formatCurrency(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600">Tổng tiền đơn hàng:</span>
              <span className="text-lg font-black text-emerald-600">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {/* Info panel */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Thông Tin Giao Hàng
              </h3>
              <div className="space-y-1.5 text-xs">
                <p className="font-bold text-slate-900">{order.recipientName}</p>
                <p className="text-slate-600">{order.recipientPhone}</p>
                <p className="text-slate-500">{order.deliveryAddress}</p>
              </div>
            </div>

            {/* Shipping Info Card */}
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" /> Thông Tin Vận Chuyển
                </h3>
                {order.shippingOrder && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getShippingStatusConfig(order.shippingOrder.status).color}`}>
                    {getShippingStatusConfig(order.shippingOrder.status).label}
                  </span>
                )}
              </div>

              {order.shippingOrder ? (
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Hãng vận chuyển:</span>
                    <span className="font-bold text-slate-900">
                      {order.shippingOrder.carrier === 'ECO_EXPRESS' ? 'EcoMart Express' : order.shippingOrder.carrier}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Mã vận đơn:</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                      <span>{order.shippingOrder.trackingNumber}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyTracking(order.shippingOrder!.trackingNumber)}
                        className="p-0.5 hover:text-emerald-900 transition-colors"
                        title="Sao chép mã vận đơn"
                      >
                        {hasCopiedTracking ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  {order.shippingOrder.estimatedDeliveryAt && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Dự kiến giao:</span>
                      <span className="font-semibold text-slate-800">
                        {formatDate(order.shippingOrder.estimatedDeliveryAt)}
                      </span>
                    </div>
                  )}
                  {order.shippingOrder.pickedAt && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Lấy hàng lúc:</span>
                      <span className="text-slate-700">{formatDate(order.shippingOrder.pickedAt)}</span>
                    </div>
                  )}
                  {order.shippingOrder.deliveredAt && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Giao xong lúc:</span>
                      <span className="text-slate-700">{formatDate(order.shippingOrder.deliveredAt)}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsTrackingModalOpen(true)}
                    className="w-full mt-2 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 active:scale-[0.99] text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200/80 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    Xem Lịch Sử Giao Vận Chi Tiết
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl text-center space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Chưa khởi tạo vận đơn</p>
                  <p className="text-[10px] text-slate-400">Vận đơn sẽ được tự động tạo khi bấm 'Xác Nhận Đơn'.</p>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Thanh Toán
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Phương thức:</span>
                  <span className="font-bold text-slate-900">{getPaymentMethodLabel(order.paymentMethod)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Trạng thái:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${paymentCfg.color}`}>
                    {paymentCfg.label}
                  </span>
                </div>
                {order.paidAt && (
                  <div className="flex justify-between text-slate-600">
                    <span>Thanh toán lúc:</span>
                    <span className="font-semibold">{formatDate(order.paidAt)}</span>
                  </div>
                )}
                {order.paymentStatus === 'UNPAID' && order.status !== 'CANCELLED' && order.paymentMethod !== 'COD' && (
                  <button
                    type="button"
                    onClick={() => setShowApprovePaymentModal(true)}
                    disabled={isApprovingPayment}
                    className="w-full mt-2 py-2 px-3 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Đối Soát / Duyệt TT Thủ Công
                  </button>
                )}
              </div>
            </div>

            {/* Payment Transactions */}
            {order.paymentTransactions?.length > 0 && (
              <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-900">Giao Dịch Thanh Toán</h3>
                <div className="space-y-2">
                  {order.paymentTransactions.map((tx) => (
                    <div key={tx.id} className="text-[11px] p-2.5 bg-slate-50 rounded-xl space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Mã GD:</span>
                        <span className="font-mono font-semibold text-slate-700">{tx.paymentRef}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Số tiền:</span>
                        <span className="font-bold text-slate-900">{formatCurrency(tx.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Trạng thái:</span>
                        <span className="font-semibold text-slate-700">{tx.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isTrackingModalOpen && order.shippingOrder && (
        <ShippingTrackingModal
          trackingNumber={order.shippingOrder.trackingNumber}
          onClose={() => setIsTrackingModalOpen(false)}
        />
      )}
    </>
  );
};

export default ManagerOrderDetailPage;
