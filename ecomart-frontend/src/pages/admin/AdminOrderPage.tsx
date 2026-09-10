import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  XCircle,
  Search,
  ChevronRight,
  Loader2,
  X,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { orderApi } from '../../services/orderApi';
import { useToast } from '../../context/ToastContext';
import {
  Order,
  OrderStatus,
  AdminOrderFilterParams,
  PaymentMethod,
  CustomAxiosError,
} from '../../types';

type TabStatus = 'ALL' | OrderStatus;

const STATUS_TABS: { value: TabStatus; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const PAYMENT_METHOD_OPTS: { value: string; label: string }[] = [
  { value: '', label: 'Tất cả PTTT' },
  { value: 'COD', label: 'COD' },
  { value: 'VNPAY', label: 'VNPay' },
  { value: 'SEPAY', label: 'SePay' },
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

const getStatusConfig = (status: OrderStatus): { label: string; color: string } => {
  const map: Record<OrderStatus, { label: string; color: string }> = {
    PENDING: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
    COMPLETED: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700' },
    CANCELLED: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-700' },
  };
  return map[status] ?? { label: status, color: 'bg-slate-100 text-slate-700' };
};

const getPaymentStatusConfig = (status: string): { label: string; color: string } => {
  const map: Record<string, { label: string; color: string }> = {
    UNPAID: { label: 'Chưa TT', color: 'bg-amber-100 text-amber-700' },
    PAID: { label: 'Đã TT', color: 'bg-emerald-100 text-emerald-700' },
    FAILED: { label: 'TT thất bại', color: 'bg-rose-100 text-rose-700' },
    REFUNDED: { label: 'Đã hoàn', color: 'bg-blue-100 text-blue-700' },
  };
  return map[status] ?? { label: status, color: 'bg-slate-100 text-slate-700' };
};

// =============================================
// Cancel Modal
// =============================================
interface CancelModalProps {
  orderId: number;
  orderCode: string;
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
}

const CancelModal: React.FC<CancelModalProps> = ({ orderId: _orderId, orderCode, onConfirm, onClose }) => {
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              Hủy đơn hàng #{orderCode}
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

        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            Thao tác này sẽ hủy đơn hàng và hoàn trả tồn kho. Không thể hoàn tác.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Lý do hủy đơn hàng <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do hủy đơn hàng (bắt buộc)..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent resize-none"
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Không hủy
            </button>
            <button
              type="submit"
              disabled={!reason.trim() || isSubmitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
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

// =============================================
// Main Component
// =============================================
export const AdminOrderPage: React.FC = () => {
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabStatus>('ALL');
  const [keyword, setKeyword] = useState<string>('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Cancel modal
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  // Confirm action state
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOrders = useCallback(
    async (kw: string = keyword) => {
      setIsLoading(true);
      const params: AdminOrderFilterParams = {
        page: currentPage,
        pageSize: 15,
        keyword: kw || undefined,
        status: activeTab === 'ALL' ? undefined : activeTab,
        paymentMethod: (paymentMethodFilter as PaymentMethod) || undefined,
      };
      try {
        const res = await orderApi.adminGetOrders(params);
        const data = res.data;
        setOrders(data?.items || data?.content || []);
        setTotalPages(data?.pagination?.totalPages ?? data?.totalPages ?? 1);
      } catch {
        showToast('Không thể tải danh sách đơn hàng.', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, currentPage, keyword, paymentMethodFilter, showToast]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    setKeyword(val);
    setCurrentPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchOrders(val);
    }, 300);
  };

  const handleTabChange = (tab: TabStatus): void => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleApprovePayment = async (orderId: number): Promise<void> => {
    setApprovingId(orderId);
    try {
      const res = await orderApi.adminApprovePayment(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data : o)));
      showToast('Đã phê duyệt thanh toán thành công (Chuyển trạng thái ĐÃ XÁC NHẬN).', 'success');
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      showToast(customError.response?.data?.message || 'Lỗi phê duyệt thanh toán.', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const handleConfirmOrder = async (orderId: number): Promise<void> => {
    setConfirmingId(orderId);
    try {
      const res = await orderApi.adminConfirmOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data : o)));
      showToast('Đã xác nhận đơn hàng thành công.', 'success');
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      showToast(customError.response?.data?.message || 'Lỗi xác nhận đơn hàng.', 'error');
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCompleteOrder = async (orderId: number): Promise<void> => {
    setCompletingId(orderId);
    try {
      const res = await orderApi.adminCompleteOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data : o)));
      showToast('Đơn hàng đã được hoàn thành.', 'success');
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      showToast(customError.response?.data?.message || 'Lỗi hoàn thành đơn hàng.', 'error');
    } finally {
      setCompletingId(null);
    }
  };

  const handleCancelConfirm = async (reason: string): Promise<void> => {
    if (!cancelTarget) return;
    try {
      const res = await orderApi.adminCancelOrder(cancelTarget.id, { cancellationReason: reason });
      setOrders((prev) => prev.map((o) => (o.id === cancelTarget.id ? res.data : o)));
      showToast('Đã hủy đơn hàng và hoàn tồn kho thành công.', 'success');
      setCancelTarget(null);
    } catch (error: unknown) {
      const customError = error as CustomAxiosError;
      showToast(customError.response?.data?.message || 'Lỗi hủy đơn hàng.', 'error');
    }
  };

  // KPI Cards
  const kpiStats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    confirmed: orders.filter((o) => o.status === 'CONFIRMED').length,
    completed: orders.filter((o) => o.status === 'COMPLETED').length,
  }), [orders]);

  return (
    <>
      {cancelTarget && (
        <CancelModal
          orderId={cancelTarget.id}
          orderCode={cancelTarget.orderCode}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
        />
      )}

      <div className="space-y-6 pb-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản Lý Đơn Hàng</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Xem, xác nhận, hoàn thành và hủy đơn hàng của khách hàng
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Tổng đơn hàng', value: kpiStats.total, icon: <ShoppingBag className="w-5 h-5" />, color: 'text-slate-600 bg-slate-100' },
            { label: 'Chờ xác nhận', value: kpiStats.pending, icon: <Clock className="w-5 h-5" />, color: 'text-amber-600 bg-amber-100' },
            { label: 'Đã xác nhận', value: kpiStats.confirmed, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-blue-600 bg-blue-100' },
            { label: 'Hoàn thành', value: kpiStats.completed, icon: <Package className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-100' },
          ].map((card) => (
            <div key={card.label} className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-[11px] text-slate-500">{card.label}</p>
                <p className="text-2xl font-black text-slate-900">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm space-y-3">
          {/* Tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabChange(tab.value)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab.value
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + Payment filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={handleKeywordChange}
                placeholder="Tìm kiếm mã đơn, tên khách hàng..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              />
            </div>
            <select
              value={paymentMethodFilter}
              onChange={(e) => { setPaymentMethodFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-w-[140px]"
            >
              {PAYMENT_METHOD_OPTS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center bg-white border border-gray-200 rounded-2xl shadow-sm space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-500">Không có đơn hàng nào phù hợp.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200">
                    {['Mã đơn', 'Khách hàng', 'Tổng tiền', 'PTTT', 'Đơn hàng', 'Thanh toán', 'Ngày đặt', 'Thao tác'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-bold text-slate-600 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => {
                    const statusCfg = getStatusConfig(order.status);
                    const paymentCfg = getPaymentStatusConfig(order.paymentStatus);
                    const isConfirming = confirmingId === order.id;
                    const isCompleting = completingId === order.id;

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-extrabold text-slate-900 whitespace-nowrap">
                          #{order.orderCode}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <p className="font-semibold">{order.recipientName}</p>
                          <p className="text-[10px] text-slate-400">{order.recipientPhone}</p>
                        </td>
                        <td className="px-4 py-3 font-extrabold text-emerald-700 whitespace-nowrap">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{order.paymentMethod}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${paymentCfg.color}`}>
                            {paymentCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {formatDate(order.orderedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 flex-nowrap">
                            {order.paymentStatus === 'UNPAID' && order.status !== 'CANCELLED' && (
                              <button
                                type="button"
                                onClick={() => handleApprovePayment(order.id)}
                                disabled={approvingId === order.id}
                                title="Phê duyệt đã thanh toán thành công"
                                className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-xs disabled:opacity-50"
                              >
                                {approvingId === order.id ? (
                                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                ) : (
                                  <CreditCard className="w-2.5 h-2.5" />
                                )}
                                Duyệt TT
                              </button>
                            )}
                            {order.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => handleConfirmOrder(order.id)}
                                disabled={isConfirming}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 disabled:opacity-50"
                              >
                                {isConfirming ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
                                XN
                              </button>
                            )}
                            {order.status === 'CONFIRMED' && (
                              <button
                                type="button"
                                onClick={() => handleCompleteOrder(order.id)}
                                disabled={isCompleting}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 disabled:opacity-50"
                              >
                                {isCompleting ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Package className="w-2.5 h-2.5" />}
                                HT
                              </button>
                            )}
                            {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                              <button
                                type="button"
                                onClick={() => setCancelTarget(order)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold rounded-lg border border-rose-100"
                              >
                                Hủy
                              </button>
                            )}
                            <Link
                              to={`/admin/orders/${order.id}`}
                              className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              aria-label="Xem chi tiết"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
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
    </>
  );
};

export default AdminOrderPage;
