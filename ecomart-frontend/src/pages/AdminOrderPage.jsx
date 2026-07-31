import React from 'react';
import Badge from '../components/common/Badge';

const AdminOrderPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Quản lý Đơn hàng (Admin)</h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3">Mã đơn</th>
              <th className="px-6 py-3">Khách hàng</th>
              <th className="px-6 py-3">Tổng tiền</th>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3 text-right">Thao tác Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {[
              { id: 'TH-ORD-001', name: 'Nguyễn Văn A', status: 'PENDING' },
              { id: 'TH-ORD-002', name: 'Trần Thị B', status: 'CONFIRMED' },
              { id: 'TH-ORD-003', name: 'Lê Văn C', status: 'COMPLETED' },
            ].map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono font-bold">{order.id}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{order.name}</td>
                <td className="px-6 py-4 font-bold text-blue-600">15.990.000 ₫</td>
                <td className="px-6 py-4">
                  <Badge status={order.status} />
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {order.status === 'PENDING' && (
                    <button className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded hover:bg-blue-700">
                      Xác nhận
                    </button>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <button className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded hover:bg-emerald-700">
                      Hoàn thành
                    </button>
                  )}
                  {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                    <button className="text-xs bg-rose-100 text-rose-700 px-2.5 py-1 rounded hover:bg-rose-200">
                      Hủy đơn
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrderPage;
