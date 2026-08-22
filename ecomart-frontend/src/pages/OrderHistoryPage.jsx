import React, { useEffect, useState } from 'react';
import { orderApi } from '../services/orderApi';
import { Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getOrders({ page: 1, pageSize: 20 });
      if (res.success) {
        setOrders(res.data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    try {
      const res = await orderApi.cancelOrder(orderId);
      if (res.success) {
        alert('Đã hủy đơn hàng và hoàn tồn kho thành công!');
        fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể hủy đơn hàng.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
            <Clock className="w-3.5 h-3.5" /> Đang Chờ Xác Nhận
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            <CheckCircle className="w-3.5 h-3.5" /> Đã Xác Nhận
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
            <CheckCircle className="w-3.5 h-3.5" /> Hoàn Thành
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
            <XCircle className="w-3.5 h-3.5" /> Đã Hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Lịch Sử Đơn Hàng</h1>
          <p className="text-xs text-slate-500">Theo dõi trạng thái và chi tiết các đơn hàng bạn đã mua</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white text-slate-500 space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-medium text-slate-600">Bạn chưa có đơn hàng nào.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              {/* Order Header */}
              <div className="flex flex-wrap justify-between items-center gap-4 border-b pb-4 border-slate-100">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-900 text-base">Đơn hàng #{order.orderCode}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Tổng tiền đơn hàng</span>
                  <span className="text-xl font-extrabold text-blue-600">
                    {Number(order.totalAmount).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm py-1">
                    <div>
                      <p className="font-bold text-slate-800">{item.productName}</p>
                      <p className="text-xs text-slate-400">
                        {Number(item.unitPrice).toLocaleString('vi-VN')} ₫ × {item.quantity}
                      </p>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      {Number(item.lineTotal).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                ))}
              </div>

              {/* Cancellation Reason if Cancelled */}
              {order.status === 'CANCELLED' && order.cancellationReason && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Lý do hủy: {order.cancellationReason}</span>
                </div>
              )}

              {/* Customer Cancel Action */}
              {order.status === 'PENDING' && (
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-colors"
                  >
                    Hủy Đơn Hàng Này
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
