import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ShoppingCart,
  RotateCcw,
  Loader2,
  Star,
  X,
  QrCode,
  Truck,
  Boxes,
  Navigation,
  ChevronRight,
} from 'lucide-react';
import { orderApi } from '../services/orderApi';
import { reviewApi } from '../services/reviewApi';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Order, OrderItem, CustomAxiosError } from '../types';
import { VietQrModal } from '../components/payment/VietQrModal';
import { ReturnRequestModal } from '../components/return/ReturnRequestModal';
import { ShippingTrackingModal } from '../components/shipping/ShippingTrackingModal';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

const getPaymentMethodLabel = (method: string): string => {
  const map: Record<string, string> = { COD: 'COD - Nhận hàng thanh toán', VNPAY: 'VNPay', SEPAY: 'SePay VietQR' };
  return map[method] ?? method;
};

const getCarrierLabel = (carrier?: string): string => {
  const map: Record<string, string> = {
    ECO_EXPRESS: 'Eco Express (Vận chuyển sinh thái)',
    GHN: 'Giao Hàng Nhanh (GHN)',
    GHTK: 'Giao Hàng Tiết Kiệm (GHTK)',
    VIETTEL_POST: 'Viettel Post',
  };
  return carrier ? (map[carrier] ?? carrier) : 'Eco Express';
};

const getShippingStatusConfig = (status?: string): { label: string; color: string; desc: string } => {
  const configs: Record<string, { label: string; color: string; desc: string }> = {
    READY_TO_PICK: {
      label: 'Chờ lấy hàng',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      desc: 'EcoMart đã đóng gói kiện hàng và đang chờ bưu tá Eco Express đến nhận.',
    },
    PICKING: {
      label: 'Đang lấy hàng',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      desc: 'Bưu tá đã lấy kiện hàng và đang vận chuyển về trung tâm phân loại.',
    },
    DELIVERING: {
      label: 'Đang vận chuyển',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      desc: 'Kiện hàng đang được luân chuyển an toàn đến bưu cục gần bạn.',
    },
    ARRIVED_AT_LOCAL_HUB: {
      label: 'Đã đến bưu cục phát (Giao trong 24h)',
      color: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      desc: 'Thông báo: Kiện hàng đã đến bưu cục phát tại địa phương gần bạn. Dự kiến sẽ được giao trong vòng 24 giờ tới.',
    },
    DELIVERED: {
      label: 'Giao hàng thành công',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      desc: 'Giao hàng thành công. Bạn đã nhận trọn vẹn kiện hàng xanh.',
    },
    DELIVERY_FAILED: {
      label: 'Giao thất bại',
      color: 'bg-rose-100 text-rose-800 border-rose-200',
      desc: 'Giao hàng chưa thành công. Bưu tá sẽ liên hệ lại sớm nhất.',
    },
    RETURNED_TO_SENDER: {
      label: 'Đã hoàn kho',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      desc: 'Kiện hàng đã được hoàn trả về kho EcoMart.',
    },
  };
  return (
    (status && configs[status]) || {
      label: status || 'Đang xử lý',
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      desc: 'Đơn hàng đang trong tiến trình xử lý.',
    }
  );
};

const getPaymentStatusConfig = (status: string): { label: string; color: string } => {
  const configs: Record<string, { label: string; color: string }> = {
    UNPAID: { label: 'Chưa thanh toán', color: 'bg-amber-100 text-amber-700' },
    PAID: { label: 'Đã thanh toán', color: 'bg-emerald-100 text-emerald-700' },
    FAILED: { label: 'Thanh toán thất bại', color: 'bg-rose-100 text-rose-700' },
    REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-blue-100 text-blue-700' },
  };
  return configs[status] ?? { label: status, color: 'bg-slate-100 text-slate-700' };
};

// 5-Stage Order & Delivery Timeline Steps
interface TimelineStep {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { key: 'PLACED', label: 'Đã Đặt Hàng', icon: <Clock className="w-4 h-4" /> },
  { key: 'PROCESSING', label: 'Đã Xác Nhận & Đóng Gói', icon: <Boxes className="w-4 h-4" /> },
  { key: 'DELIVERING', label: 'Đang Vận Chuyển', icon: <Truck className="w-4 h-4" /> },
  { key: 'LOCAL_HUB', label: 'Đến Bưu Cục (Giao 24h)', icon: <Navigation className="w-4 h-4" /> },
  { key: 'COMPLETED', label: 'Giao Thành Công', icon: <CheckCircle2 className="w-4 h-4" /> },
];

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { handleAddToCart } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cancelConfirm, setCancelConfirm] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [isReordering, setIsReordering] = useState<boolean>(false);
  const [isRetryingPayment, setIsRetryingPayment] = useState<boolean>(false);
  const [isVietQrOpen, setIsVietQrOpen] = useState<boolean>(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState<boolean>(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState<boolean>(false);

  // Review modal state
  const [reviewingItem, setReviewingItem] = useState<OrderItem | null>(null);
  const [reviewedOrderItemIds, setReviewedOrderItemIds] = useState<Set<number>>(new Set());

  // Load user's reviewed order item IDs
  useEffect(() => {
    reviewApi
      .getMyReviews({ page: 1, pageSize: 50 })
      .then((res) => {
        if (res.data) {
          const items = res.data.items || res.data.content || [];
          const ids = new Set<number>(items.map((r) => r.orderItemId));
          setReviewedOrderItemIds(ids);
        }
      })
      .catch(() => {});
  }, []);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await orderApi.getOrderDetail(Number(id));
      setOrder(res.data);
    } catch {
      showToast('Không tìm thấy đơn hàng này.', 'error');
      navigate('/orders');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, showToast]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleReviewSubmitted = (orderItemId: number): void => {
    setReviewedOrderItemIds((prev) => new Set([...prev, orderItemId]));
    setReviewingItem(null);
  };

  const handleCancelOrder = async (): Promise<void> => {
    if (!order) return;
    setIsCancelling(true);
    try {
      const res = await orderApi.cancelOrder(order.id);
      setOrder(res.data);
      showToast('Đã hủy đơn hàng thành công. Tồn kho đã được hoàn trả.', 'success');
      setCancelConfirm(false);
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      showToast(customError.response?.data?.message || 'Không thể hủy đơn hàng.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRetryVNPay = async (): Promise<void> => {
    if (!order) return;
    setIsRetryingPayment(true);
    try {
      const res = await orderApi.retryPayment(order.id);
      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        showToast('Không thể tạo liên kết thanh toán VNPay. Vui lòng thử lại.', 'error');
      }
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      showToast(customError.response?.data?.message || 'Có lỗi xảy ra khi thử lại thanh toán.', 'error');
    } finally {
      setIsRetryingPayment(false);
    }
  };

  const handleReorder = async (): Promise<void> => {
    if (!order) return;
    setIsReordering(true);
    let addedCount = 0;
    for (const item of order.items) {
      const ok = await handleAddToCart(item.productId, item.quantity);
      if (ok) addedCount++;
    }
    setIsReordering(false);
    if (addedCount > 0) {
      showToast(`Đã thêm ${addedCount} sản phẩm vào giỏ hàng.`, 'success');
      navigate('/cart');
    } else {
      showToast('Không thể thêm sản phẩm vào giỏ hàng. Sản phẩm có thể đã hết hàng.', 'error');
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

  // Tính toán bước hiện tại cho Timeline 5 giai đoạn liên thông Vận chuyển
  const isCancelled = order.status === 'CANCELLED';

  const getTimelineInfo = () => {
    if (isCancelled) return { currentStepIndex: -1, stepDates: [] as (string | undefined)[] };

    let stepIdx = 0;
    const dates: (string | undefined)[] = [order.orderedAt, undefined, undefined, undefined, undefined];

    if (order.status === 'PENDING') {
      stepIdx = 0;
    } else if (order.status === 'CONFIRMED') {
      stepIdx = 1;
      dates[1] = order.confirmedAt;

      const shipping = order.shippingOrder;
      if (shipping) {
        if (shipping.status === 'READY_TO_PICK' || shipping.status === 'PICKING') {
          stepIdx = 1;
          dates[1] = shipping.pickedAt || order.confirmedAt;
        } else if (shipping.status === 'DELIVERING') {
          stepIdx = 2;
          dates[1] = order.confirmedAt;
          dates[2] = shipping.pickedAt || shipping.updatedAt;
        } else if (shipping.status === 'ARRIVED_AT_LOCAL_HUB') {
          stepIdx = 3;
          dates[1] = order.confirmedAt;
          dates[2] = shipping.pickedAt;
          dates[3] = shipping.updatedAt;
        } else if (shipping.status === 'DELIVERED') {
          stepIdx = 4;
          dates[1] = order.confirmedAt;
          dates[2] = shipping.pickedAt;
          dates[3] = shipping.updatedAt;
          dates[4] = shipping.deliveredAt || order.completedAt;
        }
      }
    } else if (order.status === 'COMPLETED') {
      stepIdx = 4;
      dates[1] = order.confirmedAt;
      dates[2] = order.shippingOrder?.pickedAt;
      dates[3] = order.shippingOrder?.updatedAt;
      dates[4] = order.completedAt || order.shippingOrder?.deliveredAt;
    }

    return { currentStepIndex: stepIdx, stepDates: dates };
  };

  const { currentStepIndex, stepDates } = getTimelineInfo();

  const paymentStatusCfg = getPaymentStatusConfig(order.paymentStatus);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
            aria-label="Quay lại lịch sử đơn hàng"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Chi tiết đơn #{order.orderCode}
            </h1>
            <p className="text-xs text-slate-400">
              Đặt lúc: {formatDate(order.orderedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Pay with VietQR button */}
          {order.paymentStatus === 'UNPAID' && order.status !== 'CANCELLED' && order.paymentMethod === 'SEPAY' && (
            <button
              type="button"
              onClick={() => setIsVietQrOpen(true)}
              tabIndex={0}
              aria-label="Mở mã VietQR để thanh toán"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Quét mã VietQR thanh toán</span>
            </button>
          )}

          {/* Pay with VNPay button */}
          {order.paymentStatus === 'UNPAID' && order.status !== 'CANCELLED' && order.paymentMethod === 'VNPAY' && (
            <button
              type="button"
              onClick={handleRetryVNPay}
              disabled={isRetryingPayment}
              tabIndex={0}
              aria-label="Thanh toán lại qua cổng VNPay"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {isRetryingPayment ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CreditCard className="w-3.5 h-3.5" />
              )}
              <span>Thanh toán qua VNPay</span>
            </button>
          )}

          {/* Re-order button */}
          {order.status === 'COMPLETED' && (
            <>
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                Đổi trả / Bảo hành
              </button>
              <button
                type="button"
                onClick={handleReorder}
                disabled={isReordering}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-colors disabled:opacity-50"
              >
                {isReordering ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                Mua lại
              </button>
            </>
          )}

          {/* Cancel button */}
          {order.status === 'PENDING' && !cancelConfirm && (
            <button
              type="button"
              onClick={() => setCancelConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-100 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Hủy đơn
            </button>
          )}
        </div>
      </div>

      {/* Cancel Confirm Banner */}
      {cancelConfirm && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <p className="text-sm font-bold text-rose-800">
              Bạn chắc chắn muốn hủy đơn hàng #{order.orderCode}?
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-50"
            >
              {isCancelling && <Loader2 className="w-3 h-3 animate-spin" />}
              Xác nhận hủy
            </button>
            <button
              type="button"
              onClick={() => setCancelConfirm(false)}
              className="px-4 py-1.5 bg-white border border-gray-200 text-slate-600 text-xs font-bold rounded-xl"
            >
              Không hủy
            </button>
          </div>
        </div>
      )}

      {/* Order Status Timeline */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Trạng Thái Đơn Hàng</h2>
          {order.shippingOrder && (
            <button
              type="button"
              onClick={() => setIsShippingModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Tra cứu hành trình vận chuyển</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isCancelled ? (
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-rose-800">Đơn hàng đã bị hủy</p>
              {order.cancellationReason && (
                <p className="text-xs text-rose-600 mt-0.5">
                  Lý do: {order.cancellationReason}
                </p>
              )}
              {order.cancelledAt && (
                <p className="text-xs text-rose-500 mt-0.5">{formatDate(order.cancelledAt)}</p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-0">
              {TIMELINE_STEPS.map((step, index) => {
                const isDone = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const timestamp = stepDates[index];
                const isLast = index === TIMELINE_STEPS.length - 1;

                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center">
                    {/* Connector + Circle */}
                    <div className="flex items-center w-full">
                      {index > 0 && (
                        <div className={`flex-1 h-1 ${isDone ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                      )}
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
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

                    {/* Label + Timestamp */}
                    <div className="text-center mt-2 px-1">
                      <p className={`text-[10px] sm:text-[11px] font-bold ${isDone ? 'text-emerald-700' : 'text-slate-400'} leading-tight`}>
                        {step.label}
                      </p>
                      {timestamp && isDone && (
                        <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">{formatDate(timestamp)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Shipping Callout Banner */}
            {order.shippingOrder && (
              <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        {getCarrierLabel(order.shippingOrder.carrier)}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                        #{order.shippingOrder.trackingNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getShippingStatusConfig(order.shippingOrder.status).color}`}>
                        {getShippingStatusConfig(order.shippingOrder.status).label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {order.shippingOrder.logs && order.shippingOrder.logs.length > 0
                        ? order.shippingOrder.logs[order.shippingOrder.logs.length - 1].note
                        : getShippingStatusConfig(order.shippingOrder.status).desc}
                    </p>
                    {order.shippingOrder.estimatedDeliveryAt && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Dự kiến giao: <span className="font-semibold text-slate-700">{formatDate(order.shippingOrder.estimatedDeliveryAt)}</span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsShippingModalOpen(true)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 whitespace-nowrap transition-all"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xem hành trình bưu cục</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách sản phẩm */}
        <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              Sản Phẩm Đã Đặt ({order.items?.length ?? 0} mặt hàng)
            </h2>
          </div>

          <div className="divide-y divide-gray-50">
            {order.items?.map((item) => {
              const isReviewed = reviewedOrderItemIds.has(item.id);

              return (
                <div key={item.id} className="p-4 flex items-center gap-3">
                  {item.productImageUrl ? (
                    <img
                      src={item.productImageUrl}
                      alt={item.productName}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center">
                      <Package className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.productId}`}
                      className="text-xs font-bold text-slate-900 hover:text-emerald-600 transition-colors line-clamp-2"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {formatCurrency(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs font-extrabold text-slate-900">
                      {formatCurrency(item.lineTotal)}
                    </span>

                    {/* Review Button for COMPLETED orders */}
                    {order.status === 'COMPLETED' && (
                      <div>
                        {isReviewed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                            <CheckCircle2 className="w-3 h-3" /> Đã đánh giá
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setReviewingItem(item)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                            Đánh giá
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tổng tiền */}
          <div className="p-4 border-t border-gray-100 bg-slate-50/50 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600">Tổng tiền đơn hàng:</span>
            <span className="text-lg font-black text-emerald-600">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Thông tin phụ */}
        <div className="space-y-4">
          {/* Thông tin vận chuyển */}
          {order.shippingOrder && (
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  Thông Tin Vận Chuyển
                </h3>
                <button
                  type="button"
                  onClick={() => setIsShippingModalOpen(true)}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Chi tiết →
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Đơn vị:</span>
                  <span className="font-bold text-slate-900">
                    {getCarrierLabel(order.shippingOrder.carrier)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Mã vận đơn:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    #{order.shippingOrder.trackingNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Trạng thái:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getShippingStatusConfig(order.shippingOrder.status).color}`}>
                    {getShippingStatusConfig(order.shippingOrder.status).label}
                  </span>
                </div>
                {order.shippingOrder.estimatedDeliveryAt && (
                  <div className="flex justify-between text-slate-600">
                    <span>Dự kiến giao:</span>
                    <span className="font-semibold text-slate-900">
                      {formatDate(order.shippingOrder.estimatedDeliveryAt)}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsShippingModalOpen(true)}
                    className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Tra cứu hành trình vận đơn</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Địa chỉ giao hàng */}
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Thông Tin Giao Hàng
            </h3>
            <div className="space-y-1.5 text-xs text-slate-600">
              <p className="font-bold text-slate-900">{order.recipientName}</p>
              <p>{order.recipientPhone}</p>
              <p className="text-slate-500">{order.deliveryAddress}</p>
            </div>
          </div>

          {/* Thông tin thanh toán */}
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              Thông Tin Thanh Toán
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Phương thức:</span>
                <span className="font-bold text-slate-900">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Trạng thái:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${paymentStatusCfg.color}`}
                >
                  {paymentStatusCfg.label}
                </span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between text-slate-600">
                  <span>Thanh toán lúc:</span>
                  <span className="font-semibold">{formatDate(order.paidAt)}</span>
                </div>
              )}

              {/* Quick Pay CTA in Payment Card for UNPAID orders */}
              {order.paymentStatus === 'UNPAID' && order.status !== 'CANCELLED' && (
                <div className="pt-2 border-t border-gray-100">
                  {order.paymentMethod === 'SEPAY' ? (
                    <button
                      type="button"
                      onClick={() => setIsVietQrOpen(true)}
                      tabIndex={0}
                      aria-label="Mở mã QR thanh toán"
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Quét mã VietQR ngay</span>
                    </button>
                  ) : order.paymentMethod === 'VNPAY' ? (
                    <button
                      type="button"
                      onClick={handleRetryVNPay}
                      disabled={isRetryingPayment}
                      tabIndex={0}
                      aria-label="Thanh toán qua cổng VNPay"
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isRetryingPayment ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CreditCard className="w-3.5 h-3.5" />
                      )}
                      <span>Thanh toán qua VNPay</span>
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewingItem && (
        <ReviewModal
          item={reviewingItem}
          onSuccess={() => handleReviewSubmitted(reviewingItem.id)}
          onClose={() => setReviewingItem(null)}
        />
      )}

      {/* VietQR Payment Modal */}
      {order && (
        <VietQrModal
          isOpen={isVietQrOpen}
          orderId={order.id}
          orderCode={order.orderCode}
          amount={order.totalAmount}
          onClose={() => setIsVietQrOpen(false)}
          onPaymentSuccess={() => {
            setIsVietQrOpen(false);
            showToast('Thanh toán đơn hàng thành công!', 'success');
            fetchOrder();
          }}
        />
      )}

      {/* Return & Warranty Modal */}
      {isReturnModalOpen && order && (
        <ReturnRequestModal
          orderId={order.id}
          orderCode={order.orderCode}
          defaultAddress={order.deliveryAddress}
          defaultName={order.recipientName}
          defaultPhone={order.recipientPhone}
          onClose={() => setIsReturnModalOpen(false)}
          onSuccess={() => {
            fetchOrder();
            navigate('/profile/returns');
          }}
        />
      )}

      {/* Shipping Tracking Modal */}
      {isShippingModalOpen && order?.shippingOrder && (
        <ShippingTrackingModal
          trackingNumber={order.shippingOrder.trackingNumber}
          onClose={() => setIsShippingModalOpen(false)}
        />
      )}
    </div>
  );
};

// =============================================
// Review Modal Component
// =============================================
interface ReviewModalProps {
  item: OrderItem;
  onSuccess: () => void;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ item, onSuccess, onClose }) => {
  const { showToast } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!rating || rating < 1) {
      showToast('Vui lòng chọn số sao đánh giá.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewApi.createReview({
        orderItemId: item.id,
        rating,
        comment: comment.trim() || undefined,
      });
      showToast('Cảm ơn bạn đã gửi đánh giá cho sản phẩm!', 'success');
      onSuccess();
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      showToast(
        customError.response?.data?.message || 'Không thể gửi đánh giá.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b pb-3 border-gray-100">
          <h2 className="text-base font-bold text-slate-900">Đánh Giá Sản Phẩm</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product preview */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
          {item.productImageUrl ? (
            <img
              src={item.productImageUrl}
              alt={item.productName}
              className="w-12 h-12 rounded-xl object-cover bg-white"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center">
              <Package className="w-5 h-5 text-slate-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 line-clamp-1">
              {item.productName}
            </p>
            <p className="text-[11px] text-slate-400">Số lượng: {item.quantity}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Picker */}
          <div className="text-center space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Mức độ hài lòng của bạn
            </label>
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                    aria-label={`${star} sao`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        active
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] font-semibold text-amber-600">
              {rating === 5 && 'Tuyệt vời, sản phẩm rất tốt!'}
              {rating === 4 && 'Hài lòng, sản phẩm ổn định'}
              {rating === 3 && 'Bình thường, tạm được'}
              {rating === 2 && 'Chưa hài lòng lắm'}
              {rating === 1 && 'Rất tệ, không ưng ý'}
            </p>
          </div>

          {/* Comment text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nhận xét chi tiết (Tùy chọn)
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Hãy chia sẻ trải nghiệm sử dụng, chất lượng vật liệu sinh thái của sản phẩm..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              maxLength={1000}
            />
            <p className="text-[10px] text-right text-slate-400 mt-1">
              {comment.length}/1000 ký tự
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Gửi Đánh Giá
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderDetailPage;

