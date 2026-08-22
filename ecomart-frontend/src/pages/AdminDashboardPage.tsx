import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Package,
  Leaf,
  Award,
  CreditCard,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { reportApi } from '../services/reportApi';
import { useToast } from '../context/ToastContext';
import {
  DashboardSummary,
  RevenueReport,
  TopSellingProduct,
  PaymentMethodStats,
  InventoryAlert,
  EcoImpact,
  ReportGroupBy,
} from '../types';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentMethodStats[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [ecoImpact, setEcoImpact] = useState<EcoImpact | null>(null);

  // Filters for Revenue Chart
  const [groupBy, setGroupBy] = useState<ReportGroupBy>('MONTH');
  const [fromDate, setFromDate] = useState<string>('2026-01-01');
  const [toDate, setToDate] = useState<string>('2026-12-31');

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        summaryRes,
        revenueRes,
        topProdRes,
        paymentRes,
        alertRes,
        ecoRes,
      ] = await Promise.all([
        reportApi.getDashboardSummary(),
        reportApi.getRevenueReport({ fromDate, toDate, groupBy }),
        reportApi.getTopSellingProducts({ limit: 5, fromDate, toDate }),
        reportApi.getPaymentMethodStats({ fromDate, toDate }),
        reportApi.getInventoryAlerts(5),
        reportApi.getEcoImpact(),
      ]);

      if (summaryRes.data) setSummary(summaryRes.data);
      if (revenueRes.data) setRevenueReport(revenueRes.data);
      if (topProdRes.data) setTopProducts(topProdRes.data);
      if (paymentRes.data) setPaymentStats(paymentRes.data);
      if (alertRes.data) setInventoryAlerts(alertRes.data);
      if (ecoRes.data) setEcoImpact(ecoRes.data);
    } catch {
      showToast('Không thể tải toàn bộ dữ liệu thống kê.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate, groupBy, showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Max revenue in period data for bar scaling
  const maxPeriodRevenue = useMemo(() => {
    if (!revenueReport?.items || revenueReport.items.length === 0) return 1;
    return Math.max(...revenueReport.items.map((i) => i.revenue), 1);
  }, [revenueReport]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Tổng Quan Hệ Thống (Dashboard)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Báo cáo hiệu suất kinh doanh, tồn kho và tác động môi trường EcoMart
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchDashboardData()}
          disabled={isLoading}
          className="p-2.5 bg-white border border-gray-200 text-slate-600 hover:text-emerald-600 rounded-xl transition-all shadow-xs self-start flex items-center gap-2 text-xs font-bold disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* SECTION 1: 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Doanh Thu */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Tổng Doanh Thu
            </span>
            <h3 className="text-xl font-black text-slate-900 truncate">
              {formatCurrency(summary?.totalRevenue || 0)}
            </h3>
            <span className="text-[10px] text-emerald-600 font-semibold">
              Từ đơn hàng đã hoàn tất
            </span>
          </div>
        </div>

        {/* Tổng Đơn Hàng */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Tổng Đơn Hàng
            </span>
            <h3 className="text-xl font-black text-slate-900">
              {summary?.totalOrders || 0} Đơn
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
              <span className="text-emerald-600 font-bold">
                {summary?.completedOrders || 0} HT
              </span>
              <span>•</span>
              <span className="text-amber-600 font-bold">
                {summary?.pendingOrders || 0} Chờ
              </span>
            </div>
          </div>
        </div>

        {/* Khách Hàng */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Khách Hàng
            </span>
            <h3 className="text-xl font-black text-slate-900">
              {summary?.totalCustomers || 0} Người
            </h3>
            <span className="text-[10px] text-indigo-600 font-semibold">
              Tài khoản đã kích hoạt
            </span>
          </div>
        </div>

        {/* Cảnh Báo Tồn Kho */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Sản Phẩm Cảnh Báo
            </span>
            <h3 className="text-xl font-black text-amber-600">
              {summary?.lowStockProducts || 0} Loại
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              Tồn kho dưới 5 sản phẩm
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Revenue Chart & Date Filter */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b pb-4 border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Báo Cáo Doanh Thu & Đơn Hàng Theo Thời Gian
              </h2>
              <p className="text-[11px] text-slate-400">
                Thống kê doanh số thực tế từ các đơn hàng thành công
              </p>
            </div>
          </div>

          {/* Controls: Date range + Group by */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Group By Selector */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['DAY', 'MONTH', 'YEAR'] as ReportGroupBy[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGroupBy(g)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    groupBy === g
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {g === 'DAY' ? 'Ngày' : g === 'MONTH' ? 'Tháng' : 'Năm'}
                </button>
              ))}
            </div>

            {/* Date Pickers */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-gray-200 px-3 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold focus:outline-none text-xs"
              />
            </div>
            <span className="text-slate-400 text-xs">đến</span>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-gray-200 px-3 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold focus:outline-none text-xs"
              />
            </div>
          </div>
        </div>

        {/* Revenue Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-5">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">
              Doanh thu trong kỳ
            </span>
            <p className="text-2xl font-black text-emerald-600">
              {formatCurrency(revenueReport?.totalRevenue || 0)}
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">
              Số đơn hoàn thành
            </span>
            <p className="text-2xl font-black text-slate-900">
              {revenueReport?.totalCompletedOrders || 0} Đơn
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">
              Giá trị trung bình đơn (AOV)
            </span>
            <p className="text-2xl font-black text-blue-600">
              {formatCurrency(revenueReport?.averageOrderValue || 0)}
            </p>
          </div>
        </div>

        {/* Pure CSS/SVG Responsive Bar Chart */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Biểu đồ doanh thu từng kỳ ({groupBy})</span>
            <span>Đơn vị: VNĐ</span>
          </div>

          {!revenueReport?.items || revenueReport.items.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              Không có dữ liệu giao dịch trong khoảng thời gian này.
            </div>
          ) : (
            <div className="h-56 flex items-end gap-2 pt-6 pb-2 px-2 overflow-x-auto">
              {revenueReport.items.map((item, idx) => {
                const heightPercent = Math.max(
                  Math.round((item.revenue / maxPeriodRevenue) * 100),
                  4
                );

                return (
                  <div
                    key={idx}
                    className="flex-1 min-w-[40px] max-w-[64px] flex flex-col items-center gap-2 group h-full justify-end"
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] p-2 rounded-lg pointer-events-none shadow-lg whitespace-nowrap z-10">
                      <p className="font-bold">{item.period}</p>
                      <p className="text-emerald-400 font-semibold">
                        {formatCurrency(item.revenue)}
                      </p>
                      <p className="text-slate-300">{item.orderCount} đơn</p>
                    </div>

                    {/* Bar */}
                    <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-40">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl group-hover:from-emerald-500 group-hover:to-emerald-300 transition-all duration-300 shadow-sm"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* X-Axis Label */}
                    <span className="text-[10px] font-bold text-slate-500 truncate w-full text-center">
                      {item.period}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: 2-Column Grid (Top Selling Products & Payment Method Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Best Sellers */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-gray-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Top 5 Sản Phẩm Bán Chạy Nhất
            </h2>
            <Link
              to="/admin/products"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              Xem tất cả →
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              Chưa có dữ liệu bán hàng.
            </p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, index) => (
                <div
                  key={p.productId}
                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 ${
                      index === 0
                        ? 'bg-amber-100 text-amber-800'
                        : index === 1
                        ? 'bg-slate-200 text-slate-800'
                        : index === 2
                        ? 'bg-amber-700 text-amber-100'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {index + 1}
                  </span>

                  {p.productImageUrl ? (
                    <img
                      src={p.productImageUrl}
                      alt={p.productName}
                      className="w-11 h-11 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-slate-300" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {p.productName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Đã bán: <strong className="text-slate-700">{p.totalQuantitySold}</strong> sp
                    </p>
                  </div>

                  <span className="text-xs font-extrabold text-emerald-600 flex-shrink-0">
                    {formatCurrency(p.totalRevenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method Stats */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-gray-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Cơ Cấu Phương Thức Thanh Toán
            </h2>
          </div>

          {paymentStats.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              Chưa có dữ liệu thanh toán.
            </p>
          ) : (
            <div className="space-y-4 pt-2">
              {paymentStats.map((item) => {
                const label =
                  item.paymentMethod === 'COD'
                    ? 'Thanh toán khi nhận hàng (COD)'
                    : item.paymentMethod === 'VNPAY'
                    ? 'Cổng thanh toán VNPay'
                    : 'Chuyển khoản VietQR SePay';

                const colorClass =
                  item.paymentMethod === 'COD'
                    ? 'bg-emerald-500'
                    : item.paymentMethod === 'VNPAY'
                    ? 'bg-blue-500'
                    : 'bg-violet-500';

                return (
                  <div key={item.paymentMethod} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">{label}</span>
                      <span className="text-slate-500 font-medium">
                        {item.orderCount} đơn ({item.percentage?.toFixed(1) || 0}%)
                      </span>
                    </div>

                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage || 0}%` }}
                      />
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-extrabold text-slate-700">
                        {formatCurrency(item.totalAmount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: 3-Column Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Inventory Low Stock Alerts */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-gray-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Cảnh Báo Tồn Kho
            </h2>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              {inventoryAlerts.length} SP
            </span>
          </div>

          {inventoryAlerts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-semibold text-emerald-700">
                Tất cả sản phẩm đều đủ tồn kho an toàn!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inventoryAlerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.productId}
                  className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate">
                      {alert.productName}
                    </p>
                    <p className="text-[10px] text-slate-400">{alert.categoryName}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex-shrink-0 ${
                      alert.isOutOfStock
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {alert.isOutOfStock ? 'Hết hàng' : `Còn ${alert.currentStock} sp`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Eco Impact Stats */}
        <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b border-emerald-700/60 pb-3">
            <Leaf className="w-5 h-5 text-emerald-300" />
            <h2 className="text-sm font-bold text-emerald-100">
              Tác Động Sinh Thái (Eco Impact)
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl space-y-1">
              <span className="text-emerald-200 text-[11px] block">
                Điểm Eco-Score trung bình toàn sàn:
              </span>
              <p className="text-3xl font-black text-emerald-300">
                {ecoImpact?.averageEcoScore?.toFixed(1) || '0.0'} / 5.0
              </p>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-emerald-700/40">
              <span className="text-emerald-200">Sản phẩm có chứng nhận xanh đã bán:</span>
              <span className="font-extrabold text-white text-sm">
                {ecoImpact?.certifiedProductsSold || 0}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-emerald-200">Sản phẩm Eco-Score cao (4-5★) đã bán:</span>
              <span className="font-extrabold text-white text-sm">
                {ecoImpact?.highEcoScoreProductsSold || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-gray-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              Đơn Hàng Gần Đây
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              Xem tất cả →
            </Link>
          </div>

          {!summary?.recentOrders || summary.recentOrders.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              Chưa có đơn hàng nào.
            </p>
          ) : (
            <div className="space-y-3">
              {summary.recentOrders.slice(0, 4).map((o) => (
                <Link
                  key={o.id}
                  to={`/admin/orders/${o.id}`}
                  className="p-3 rounded-2xl border border-gray-100 hover:border-emerald-300 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-3 text-xs block"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-slate-900">#{o.orderCode}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {o.recipientName} • {formatCurrency(o.totalAmount)}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      o.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : o.status === 'CONFIRMED'
                        ? 'bg-blue-100 text-blue-800'
                        : o.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {o.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
