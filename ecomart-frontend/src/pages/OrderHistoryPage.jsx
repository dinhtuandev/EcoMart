import React from 'react';
import Badge from '../components/common/Badge';

const OrderHistoryPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Lịch sử đơn hàng của tôi</h1>

      {/* Order List Shell */}
      <div className="space-y-4">
        {[1, 2].map((order) => (
          <div key={order} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-3">
              <div>
                <span className="text-xs font-semibold text-slate-400">Mã đơn hàng:</span>
                <span className="font-bold text-slate-800 ml-2">#TH-ORD-20260731-0{order}</span>
              </div>
              <Badge status={order === 1 ? 'PENDING' : 'COMPLETED'} />
            </div>

            <div className="text-sm text-slate-600 space-y-1">
              <p>Ngày đặt: 31/07/2026</p>
              <p>Tổng thanh toán: <span className="font-bold text-blue-600">15.990.000 ₫</span> (COD)</p>
            </div>

            {order === 1 && (
              <div className="pt-2 flex justify-end">
                <button className="text-xs text-rose-600 hover:underline font-semibold">
                  Hủy đơn hàng này
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
