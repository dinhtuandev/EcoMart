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
} from 'lucide-react';
import { orderApi } from '../services/orderApi';
import { reviewApi } from '../services/reviewApi';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Order, OrderStatus, OrderItem, CustomAxiosError } from '../types';

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

const getPaymentStatusConfig = (status: string): { label: string; color: string } => {
  const configs: Record<string, { label: string; color: string }> = {
    UNPAID: { label: 'Chưa thanh toán', color: 'bg-amber-100 text-amber-700' },
    PAID: { label: 'Đã thanh toán', color: 'bg-emerald-100 text-emerald-700' },
    FAILED: { label: 'Thanh toán thất bại', color: 'bg-rose-100 text-rose-700' },
    REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-blue-100 text-blue-700' },
  };
  return configs[status] ?? { label: status, color: 'bg-slate-100 text-slate-700' };
};

// Order Status Timeline
interface TimelineStep {
  key: OrderStatus | 'CANCELLED';
  label: string;
  icon: React.ReactNode;
  timestampKey: keyof Order;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { key: 'PENDING', label: 'Đã Đặt Hàng', icon: <Clock className="w-4 h-4" />, timestampKey: 'orderedAt' },
  { key: 'CONFIRMED', label: 'Đã Xác Nhận', icon: <CheckCircle2 className="w-4 h-4" />, timestampKey: 'confirmedAt' },
  { key: 'COMPLETED', label: 'Hoàn Thành', icon: <Package className="w-4 h-4" />, timestampKey: 'completedAt' },
];

const STATUS_ORDER: (OrderStatus | 'CANCELLED')[] = ['PENDING', 'CONFIRMED', 'COMPLETED'];

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

  // Tính toán bước hiện tại cho Timeline
  const isCancelled = order.status === 'CANCELLED';
  const currentStepIndex = isCancelled
    ? -1
    : STATUS_ORDER.indexOf(order.status);

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

        <div className="flex items-center gap-2">
          {/* Re-order button */}
          {order.status === 'COMPLETED' && (
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
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-5">Trạng Thái Đơn Hàng</h2>

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
          <div className="flex items-start gap-0">
            {TIMELINE_STEPS.map((step, index) => {
              const isDone = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const timestamp = order[step.timestampKey] as string | undefined;
              const isLast = index === TIMELINE_STEPS.length - 1;

              return (
                <div key={step.key} className="flex-1 flex flex-col items-center">
                  {/* Connector + Circle */}
                  <div className="flex items-center w-full">
                    {index > 0 && (
                      <div className={`flex-1 h-1 ${isDone ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                    )}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
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

