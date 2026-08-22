import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  Loader2,
} from 'lucide-react';
import { orderApi } from '../services/orderApi';
import { useToast } from '../context/ToastContext';
import { Order, OrderStatus, CustomAxiosError } from '../types';

type TabStatus = 'ALL' | OrderStatus;

interface Tab {
  value: TabStatus;
  label: string;
}

const TABS: Tab[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

const getStatusConfig = (
  status: OrderStatus
): { label: string; color: string; icon: React.ReactNode } => {
  const configs: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: {
      label: 'Chờ xác nhận',
      color: 'bg-amber-100 text-amber-700',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    CONFIRMED: {
      label: 'Đã xác nhận',
      color: 'bg-blue-100 text-blue-700',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    COMPLETED: {
      label: 'Hoàn thành',
      color: 'bg-emerald-100 text-emerald-700',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    CANCELLED: {
      label: 'Đã hủy',
      color: 'bg-rose-100 text-rose-700',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  };
  return configs[status] ?? { label: status, color: 'bg-slate-100 text-slate-700', icon: null };
};

const getPaymentMethodLabel = (method: string): string => {
  const map: Record<string, string> = {
    COD: 'Thanh toán khi nhận',
    VNPAY: 'VNPay',
    SEPAY: 'SePay VietQR',
  };
  return map[method] ?? method;
};

export const OrderHistoryPage: React.FC = () => {
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabStatus>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Xác nhận hủy đơn bằng state (không dùng window.confirm)
  const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await orderApi.getOrders({
        status: activeTab === 'ALL' ? undefined : activeTab,
        page: currentPage,
        pageSize: 10,
      });
      const data = res.data;
      setOrders(data?.items || data?.content || []);
      setTotalPages(data?.pagination?.totalPages ?? data?.totalPages ?? 1);
    } catch {
      showToast('Không thể tải danh sách đơn hàng.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, currentPage, showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleTabChange = (tab: TabStatus): void => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleCancelOrder = async (orderId: number): Promise<void> => {
    setIsCancelling(true);
    try {
      await orderApi.cancelOrder(orderId);
      showToast('Đã hủy đơn hàng thành công. Tồn kho đã được hoàn trả.', 'success');
      setCancelConfirmId(null);
      fetchOrders();
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      showToast(
        customError.response?.data?.message || 'Không thể hủy đơn hàng này.',
        'error'
      );
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Lịch Sử Đơn Hàng</h1>
            <p className="text-xs text-slate-500">
              Theo dõi và quản lý tất cả đơn hàng mua sắm của bạn
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
          title="Làm mới"
          aria-label="Làm mới danh sách"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs lọc trạng thái */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-1.5 flex gap-1 flex-wrap overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleTabChange(tab.value)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.value
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
            {tab.value === 'ALL' && orders.length > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {orders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Danh Sách Đơn Hàng */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center bg-white border border-gray-200 rounded-3xl space-y-4 shadow-sm">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <p className="font-bold text-slate-700">Chưa có đơn hàng nào</p>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'ALL'
                ? 'Bạn chưa đặt hàng nào. Hãy khám phá sản phẩm xanh!'
                : `Không có đơn hàng nào ở trạng thái "${TABS.find((t) => t.value === activeTab)?.label}".`}
            </p>
          </div>
          <Link
            to="/products"
            className="inline-block px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Khám phá sản phẩm xanh
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusCfg = getStatusConfig(order.status);
            return (
              <div
                key={order.id}
                className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Order Card Header */}
                <div className="p-4 sm:p-5 flex flex-wrap items-start justify-between gap-3 border-b border-gray-100">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-sm">
                        #{order.orderCode}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusCfg.color}`}
                      >
                        {statusCfg.icon}
                        {statusCfg.label}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Đặt lúc: {formatDate(order.orderedAt)}
                    </p>
                  </div>
                  <span className="text-lg font-black text-emerald-600">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>

                {/* Items preview (max 2) */}
                <div className="px-4 sm:px-5 py-3 space-y-2">
                  {(order.items || []).slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.productImageUrl && (
                        <img
                          src={item.productImageUrl}
                          alt={item.productName}
                          className="w-9 h-9 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-700 line-clamp-1">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatCurrency(item.unitPrice)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(order.items?.length ?? 0) > 2 && (
                    <p className="text-[11px] text-slate-400 italic">
                      và {order.items.length - 2} sản phẩm khác...
                    </p>
                  )}
                </div>

                {/* Cancellation reason */}
                {order.status === 'CANCELLED' && order.cancellationReason && (
                  <div className="mx-4 sm:mx-5 mb-3 flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Lý do hủy: {order.cancellationReason}</span>
                  </div>
                )}

                {/* Cancel confirm inline */}
                {cancelConfirmId === order.id && (
                  <div className="mx-4 sm:mx-5 mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-rose-800">
                      ⚠️ Bạn có chắc muốn hủy đơn #{order.orderCode} không?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={isCancelling}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isCancelling && <Loader2 className="w-3 h-3 animate-spin" />}
                        Xác nhận hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => setCancelConfirmId(null)}
                        className="px-3 py-1.5 bg-white border border-gray-200 text-slate-600 text-xs font-bold rounded-lg"
                      >
                        Không hủy
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer actions */}
                <div className="px-4 sm:px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
                  {order.status === 'PENDING' && cancelConfirmId !== order.id && (
                    <button
                      type="button"
                      onClick={() => setCancelConfirmId(order.id)}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors border border-rose-100"
                    >
                      Hủy đơn hàng
                    </button>
                  )}
                  {cancelConfirmId === order.id ? null : <span />}

                  <Link
                    to={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors ml-auto"
                  >
                    Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setCurrentPage(p)}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                currentPage === p
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
