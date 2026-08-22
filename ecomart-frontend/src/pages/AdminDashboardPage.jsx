import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import { DollarSign, ShoppingBag, Users, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState('2026-12-31');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [statsRes, revRes] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getRevenueReport({ fromDate, toDate }),
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (revRes.success) setRevenue(revRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [fromDate, toDate]);

  if (loading && !stats) {
    return <div className="h-96 bg-slate-100 animate-pulse rounded-3xl"></div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Admin Dashboard</h1>
        <p className="text-xs text-slate-500">Tổng quan tình hình kinh doanh và chỉ số thống kê hệ thống</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Doanh Thu Tổng (COMPLETED)</span>
            <h3 className="text-xl font-extrabold text-slate-900">
              {Number(stats?.totalRevenue || 0).toLocaleString('vi-VN')} ₫
            </h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Tổng Đơn Hàng</span>
            <h3 className="text-xl font-extrabold text-slate-900">{stats?.totalOrders || 0} Đơn</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Khách Hàng</span>
            <h3 className="text-xl font-extrabold text-slate-900">{stats?.totalCustomers || 0} Người</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Sản Phẩm Sắp Hết Hàng</span>
            <h3 className="text-xl font-extrabold text-slate-900">{stats?.lowStockCount || 0} Loại</h3>
          </div>
        </div>
      </div>

      {/* Revenue Filter & Report Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-slate-100">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" /> Báo Cáo Doanh Thu Theo Thời Gian
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold focus:outline-none"
              />
            </div>
            <span>đến</span>
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 border border-slate-100 rounded-2xl p-6">
          <div>
            <span className="text-xs text-slate-500 font-medium">Doanh thu ghi nhận (Đơn COMPLETED)</span>
            <p className="text-3xl font-extrabold text-emerald-600">
              {Number(revenue?.revenue || 0).toLocaleString('vi-VN')} ₫
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Số đơn hoàn thành trong kỳ</span>
            <p className="text-3xl font-extrabold text-slate-800">{revenue?.completedOrderCount || 0} Đơn</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
