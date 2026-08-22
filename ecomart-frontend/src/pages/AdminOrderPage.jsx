import React, { useEffect, useState } from 'react';
import { orderApi } from '../services/orderApi';
import { Check, X, CheckCircle2, Clock, PackageSearch } from 'lucide-react';

const AdminOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.adminGetOrders({
        page: 1,
        pageSize: 20,
        status: statusFilter || undefined,
      });
      if (res.success) {
        setOrders(res.data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleConfirm = async (id) => {
    try {
      const res = await orderApi.adminConfirmOrder(id);
      if (res.success) {
        alert('Đã xác nhận đơn hàng thành công!');
        fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xác nhận đơn hàng.');
    }
  };

  const handleCancel = async (id) => {
    const reason = window.prompt('Nhập lý do hủy đơn hàng của Admin:');
    if (!reason) return;
    try {
      const res = await orderApi.adminCancelOrder(id, { cancellationReason: reason });
      if (res.success) {
        alert('Đã hủy đơn và hoàn tồn kho thành công!');
        fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi hủy đơn hàng.');
    }
  };

  const handleComplete = async (id) => {
    try {
      const res = await orderApi.adminCompleteOrder(id);
      if (res.success) {
        alert('Đã hoàn thành đơn hàng thành công!');
        fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi hoàn thành đơn hàng.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản Lý Đơn Hàng</h1>
          <p className="text-xs text-slate-500">Xác nhận, hủy đơn và cập nhật trạng thái đơn hàng</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">PENDING (Chờ xác nhận)</option>
          <option value="CONFIRMED">CONFIRMED (Đã xác nhận)</option>
          <option value="COMPLETED">COMPLETED (Hoàn thành)</option>
          <option value="CANCELLED">CANCELLED (Đã hủy)</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-slate-100 animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white text-slate-500">
          Không có đơn hàng nào.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-4 border-b pb-4 border-slate-100">
                <div>
                  <span className="font-extrabold text-slate-900 text-base">Đơn #{order.orderCode}</span>
                  <span className="ml-3 text-xs font-semibold text-slate-500">
                    Khách hàng: {order.recipientName} ({order.recipientPhone})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-blue-600">
                    {Number(order.totalAmount).toLocaleString('vi-VN')} ₫
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p>📍 Giao đến: {order.deliveryAddress}</p>
                {order.cancellationReason && <p className="text-rose-600 font-semibold">⚠️ Lý do hủy: {order.cancellationReason}</p>}
              </div>

              {/* Admin Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-3 justify-end">
                {order.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleConfirm(order.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Xác Nhận Đơn
                    </button>
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> Hủy Đơn
                    </button>
                  </>
                )}

                {order.status === 'CONFIRMED' && (
                  <>
                    <button
                      onClick={() => handleComplete(order.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Hoàn Thành Đơn
                    </button>
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> Hủy Đơn
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrderPage;
