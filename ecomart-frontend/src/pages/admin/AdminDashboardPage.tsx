import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Settings,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Mail,
  Calendar,
  Lock,
  Unlock,
  ChevronRight,
} from 'lucide-react';
import { userApi } from '../../services/userApi';
import { reportApi } from '../../services/reportApi';
import { useToast } from '../../context/ToastContext';
import { CustomerInsights, DashboardSummary } from '../../types';

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}> = ({ label, value, icon, color, sub }) => (
  <div className={`bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-start gap-4`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [customerInsights, setCustomerInsights] = useState<CustomerInsights | null>(null);
  const [recentUsers, setRecentUsers] = useState<
    { id: number; fullName: string; email: string; isActive: boolean; createdAt?: string }[]
  >([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summaryRes, insightsRes, usersRes] = await Promise.allSettled([
        reportApi.getDashboardSummary(),
        reportApi.getCustomerInsights(),
        userApi.adminGetUsers({ page: 1, pageSize: 5 }),
      ]);

      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value.data);
      }
      if (insightsRes.status === 'fulfilled') {
        setCustomerInsights(insightsRes.value.data);
      }
      if (usersRes.status === 'fulfilled') {
        const raw = usersRes.value.data;
        const items = Array.isArray(raw)
          ? raw
          : (raw as { items?: typeof recentUsers; content?: typeof recentUsers })?.items ||
            (raw as { items?: typeof recentUsers; content?: typeof recentUsers })?.content ||
            [];
        setRecentUsers(items.slice(0, 5));
      }
    } catch {
      showToast('Không thể tải dữ liệu dashboard.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-sm font-medium">Đang tải dữ liệu...</span>
      </div>
    );
  }

  const totalCustomers = customerInsights?.totalCustomers ?? summary?.totalCustomers ?? 0;
  const activeCustomers = customerInsights?.activeCustomers ?? 0;
  const inactiveCustomers = customerInsights?.inactiveCustomers ?? 0;
  const payingCustomers = customerInsights?.payingCustomers ?? 0;
  const repeatRate = customerInsights?.repeatPurchaseRate ?? 0;

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">Tổng quan quản trị tài khoản và hệ thống</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Tải lại
        </button>
      </div>

      {/* Stat cards — User Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Tổng khách hàng"
          value={totalCustomers.toLocaleString('vi-VN')}
          icon={<Users className="w-6 h-6" />}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Đang hoạt động"
          value={activeCustomers.toLocaleString('vi-VN')}
          icon={<UserCheck className="w-6 h-6" />}
          color="bg-emerald-50 text-emerald-600"
          sub={totalCustomers > 0 ? `${((activeCustomers / totalCustomers) * 100).toFixed(1)}% tổng số` : undefined}
        />
        <StatCard
          label="Đã bị khóa"
          value={inactiveCustomers.toLocaleString('vi-VN')}
          icon={<UserX className="w-6 h-6" />}
          color="bg-rose-50 text-rose-600"
          sub={totalCustomers > 0 ? `${((inactiveCustomers / totalCustomers) * 100).toFixed(1)}% tổng số` : undefined}
        />
        <StatCard
          label="Đã từng mua hàng"
          value={payingCustomers.toLocaleString('vi-VN')}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-amber-50 text-amber-600"
          sub={`Tỷ lệ mua lại: ${(repeatRate * 100).toFixed(1)}%`}
        />
      </div>

      {/* Two-column: Recent users + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Khách hàng gần đây
            </h2>
            <Link
              to="/admin/users"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Chưa có dữ liệu khách hàng</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                    {(u.fullName || 'U').charAt(0).toUpperCase()}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{u.fullName || 'Người dùng'}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      {u.email}
                    </p>
                  </div>
                  {/* Date */}
                  {u.createdAt && (
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1 flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                  {/* Status */}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0 ${
                      u.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {u.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                    {u.isActive ? 'Hoạt động' : 'Bị khóa'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            Thao tác nhanh
          </h2>

          <div className="flex flex-col gap-3">
            <Link
              to="/admin/users"
              className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Quản lý tài khoản</p>
                <p className="text-xs text-slate-500">Khóa / mở khóa người dùng</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
            </Link>

            <Link
              to="/admin/settings"
              className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Cài đặt cửa hàng</p>
                <p className="text-xs text-slate-500">SĐT, email, địa chỉ, bản đồ</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
            </Link>
          </div>

          {/* Summary Box từ dashboard API */}
          {summary && (
            <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thông tin hệ thống</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  Đơn chờ xác nhận
                </span>
                <span className="font-bold text-slate-700">{summary.pendingOrders ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-rose-500" />
                  TK bị khóa
                </span>
                <span className="font-bold text-rose-600">{inactiveCustomers}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Unlock className="w-3 h-3 text-emerald-500" />
                  TK hoạt động
                </span>
                <span className="font-bold text-emerald-600">{activeCustomers}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* High-risk customers */}
      {customerInsights?.highRiskCustomers && customerInsights.highRiskCustomers.length > 0 && (
        <div className="bg-white rounded-3xl border border-amber-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="font-bold text-slate-900">Khách hàng nguy cơ rời bỏ</h2>
            <span className="ml-auto text-xs text-slate-400">
              Không hoạt động lâu nhất
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {customerInsights.highRiskCustomers.slice(0, 5).map((c) => (
              <div key={c.userId} className="flex items-center gap-3 px-6 py-3.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-xs flex-shrink-0">
                  {(c.fullName || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{c.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{c.email}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-amber-600">
                    {c.daysSinceLastOrder} ngày
                  </p>
                  <p className="text-[11px] text-slate-400">kể từ đơn cuối</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
