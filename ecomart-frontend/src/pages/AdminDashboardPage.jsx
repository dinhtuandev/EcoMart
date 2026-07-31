import React from 'react';

const AdminDashboardPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Bảng điều khiển Quản trị (Admin Dashboard)</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase">Tổng số đơn hàng</p>
          <p className="text-3xl font-extrabold text-blue-600">128</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase">Doanh thu dự kiến (COD)</p>
          <p className="text-3xl font-extrabold text-emerald-600">1.450.000.000 ₫</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase">Tổng sản phẩm</p>
          <p className="text-3xl font-extrabold text-purple-600">45</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
