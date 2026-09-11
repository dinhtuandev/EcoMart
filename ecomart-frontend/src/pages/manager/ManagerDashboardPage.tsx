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
  Star,
  UserCheck,
  FolderTree,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import { reportApi } from '../../services/reportApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../providers/AuthProvider';
import { getOpsBasePath } from '../../utils/opsPaths';
import {
  DashboardSummary,
  RevenueReport,
  TopSellingProduct,
  PaymentMethodStats,
  InventoryAlert,
  EcoImpact,
  ReportGroupBy,
  CategorySales,
  BrandSales,
  CustomerInsights,
  ReviewInsightsResponse,
  CustomerGrowthResponse,
  TopCustomer,
} from '../../types';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

export const ManagerDashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const opsBase = getOpsBasePath(user?.role);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentMethodStats[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [ecoImpact, setEcoImpact] = useState<EcoImpact | null>(null);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [brandSales, setBrandSales] = useState<BrandSales[]>([]);
  const [customerInsights, setCustomerInsights] = useState<CustomerInsights | null>(null);
  const [reviewInsights, setReviewInsights] = useState<ReviewInsightsResponse | null>(null);
  const [customerGrowth, setCustomerGrowth] = useState<CustomerGrowthResponse | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);

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
        catSalesRes,
        brandSalesRes,
        insightsRes,
        reviewInsightsRes,
        growthRes,
        topCustomersRes,
      ] = await Promise.all([
        reportApi.getDashboardSummary(),
        reportApi.getRevenueReport({ fromDate, toDate, groupBy }),
        reportApi.getTopSellingProducts({ limit: 5, fromDate, toDate }),
        reportApi.getPaymentMethodStats({ fromDate, toDate }),
        reportApi.getInventoryAlerts(5),
        reportApi.getEcoImpact(),
        reportApi.getSalesByCategory({ fromDate, toDate }),
        reportApi.getSalesByBrand({ fromDate, toDate }),
        reportApi.getCustomerInsights(),
        reportApi.getReviewInsights(),
        reportApi.getCustomerGrowth({ fromDate, toDate, groupBy }),
        reportApi.getTopCustomers(5),
      ]);

      if (summaryRes.data) setSummary(summaryRes.data);
      if (revenueRes.data) setRevenueReport(revenueRes.data);
      if (topProdRes.data) setTopProducts(topProdRes.data);
      if (paymentRes.data) setPaymentStats(paymentRes.data);
      if (alertRes.data) setInventoryAlerts(alertRes.data);
      if (ecoRes.data) setEcoImpact(ecoRes.data);
      if (catSalesRes.data) setCategorySales(catSalesRes.data);
      if (brandSalesRes.data) setBrandSales(brandSalesRes.data);
      if (insightsRes.data) setCustomerInsights(insightsRes.data);
      if (reviewInsightsRes.data) setReviewInsights(reviewInsightsRes.data);
      if (growthRes.data) setCustomerGrowth(growthRes.data);
      if (topCustomersRes.data) setTopCustomers(topCustomersRes.data);
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

  const maxCustomerGrowth = useMemo(() => {
    if (!customerGrowth?.items || customerGrowth.items.length === 0) return 1;
    return Math.max(...customerGrowth.items.map((i) => i.newCustomersCount), 1);
  }, [customerGrowth]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Tổng Quan Hệ Thống (Dashboard)
          </h1>
        </div>

        <button
          type="button"
          onClick={fetchDashboardData}
          disabled={isLoading}
          tabIndex={0}
          aria-label="Làm mới dữ liệu thống kê"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-2xl shadow-sm transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* KPI Cards Grid (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu thực tế */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Doanh Thu Thực Tế
            </span>
            <p className="text-xl font-black text-slate-900">
              {formatCurrency(summary?.totalRevenue || 0)}
            </p>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Đơn hoàn thành
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Tổng đơn hoàn thành */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Đơn Hoàn Thành
            </span>
            <p className="text-xl font-black text-slate-900">
              {summary?.completedOrders || 0}{' '}
              <span className="text-xs font-normal text-slate-400">
                / {summary?.totalOrders || 0}
              </span>
            </p>
            <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> Tỷ lệ{' '}
              {summary?.totalOrders
                ? Math.round(((summary.completedOrders || 0) / summary.totalOrders) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Tổng khách hàng */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Khách Hàng
            </span>
            <p className="text-xl font-black text-slate-900">
              {summary?.totalCustomers || 0}
            </p>
            <span className="text-[10px] text-purple-600 font-bold flex items-center gap-0.5">
              <Users className="w-3 h-3" /> Thành viên đăng ký
            </span>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Tồn kho cảnh báo */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Sản Phẩm Trong Kho
            </span>
            <p className="text-xl font-black text-slate-900">
              {summary?.totalProducts || 0}
            </p>
            <span
              className={`text-[10px] font-bold flex items-center gap-0.5 ${
                summary?.lowStockProducts ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              <AlertTriangle className="w-3 h-3" /> {summary?.lowStockProducts || 0} sắp hết hàng
            </span>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              summary?.lowStockProducts
                ? 'bg-amber-50 text-amber-600'
                : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Row 2: Doanh Thu Chart & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh thu theo kỳ (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Báo Cáo Doanh Thu Theo Kỳ
              </h2>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {(['DAY', 'MONTH', 'YEAR'] as ReportGroupBy[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGroupBy(g)}
                    tabIndex={0}
                    aria-label={`Nhóm theo ${g}`}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      groupBy === g
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {g === 'DAY' ? 'Ngày' : g === 'MONTH' ? 'Tháng' : 'Năm'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date range picker */}
          <div className="flex items-center gap-3 text-xs flex-wrap bg-slate-50 p-3 rounded-2xl">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Khoảng thời gian:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              tabIndex={0}
              aria-label="Từ ngày"
              className="px-2.5 py-1 rounded-lg border border-gray-200 text-slate-700 bg-white font-medium outline-none focus:border-emerald-500"
            />
            <span className="text-slate-400">đến</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              tabIndex={0}
              aria-label="Đến ngày"
              className="px-2.5 py-1 rounded-lg border border-gray-200 text-slate-700 bg-white font-medium outline-none focus:border-emerald-500"
            />
          </div>

          {/* SVG Bar Chart */}
          <div className="space-y-3 pt-2">
            {!revenueReport?.items || revenueReport.items.length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-400">
                Không có dữ liệu doanh thu trong khoảng thời gian này.
              </div>
            ) : (
              <div className="space-y-3">
                {revenueReport.items.map((item) => {
                  const percentage = Math.round((item.revenue / maxPeriodRevenue) * 100);
                  return (
                    <div key={item.period} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{item.period}</span>
                        <span className="text-emerald-700 font-bold">
                          {formatCurrency(item.revenue)}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({item.orderCount} đơn)
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Top 5 Sản Phẩm Bán Chạy (1 col) */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-gray-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Top Sản Phẩm Bán Chạy
            </h2>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              Chưa có dữ liệu bán hàng.
            </p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div
                  key={p.productId}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>

                  <img
                    src={
                      p.productImageUrl ||
                      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150'
                    }
                    alt={p.productName}
                    className="w-10 h-10 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {p.productName}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Đã bán: <strong className="text-slate-700">{p.totalQuantitySold}</strong> •{' '}
                      {formatCurrency(p.totalRevenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Payment Breakdown, Inventory Alerts, Eco Impact & Recent Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Payment Methods */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-gray-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              Phương Thức Thanh Toán
            </h2>
          </div>

          {paymentStats.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              Chưa có dữ liệu thanh toán.
            </p>
          ) : (
            <div className="space-y-3">
              {paymentStats.map((stat) => (
                <div key={stat.paymentMethod} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-700">
                      {stat.paymentMethod === 'COD'
                        ? 'COD (Tiền mặt)'
                        : stat.paymentMethod === 'VNPAY'
                        ? 'VNPay Online'
                        : 'SePay VietQR'}
                    </span>
                    <span className="text-slate-500 font-semibold">
                      {stat.percentage?.toFixed(1)}% ({stat.orderCount} đơn)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        stat.paymentMethod === 'COD'
                          ? 'bg-emerald-500'
                          : stat.paymentMethod === 'VNPAY'
                          ? 'bg-blue-500'
                          : 'bg-violet-500'
                      }`}
                      style={{ width: `${Math.max(stat.percentage || 0, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory Alert */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-gray-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Cảnh Báo Tồn Kho
            </h2>
            <Link
              to={`${opsBase}/inventory`}
              className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold hover:bg-amber-100"
            >
              Tồn &le; 5 · Quản lý kho
            </Link>
          </div>

          {inventoryAlerts.length === 0 ? (
            <div className="text-center py-8 text-xs text-emerald-600 font-bold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Tồn kho an toàn
            </div>
          ) : (
            <div className="space-y-2.5">
              {inventoryAlerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.productId}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 text-xs"
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
              Tác Động Sinh Thái
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
              to={`${opsBase}/orders`}
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
                  to={`${opsBase}/orders/${o.id}`}
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
                    {o.status === 'COMPLETED'
                      ? 'Hoàn thành'
                      : o.status === 'CONFIRMED'
                      ? 'Đã xác nhận'
                      : o.status === 'PENDING'
                      ? 'Chờ xác nhận'
                      : o.status === 'CANCELLED'
                      ? 'Đã hủy'
                      : o.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODULE 11: ADVANCED INTELLIGENCE CENTER (3 WIDGETS)      */}
      {/* ======================================================== */}

      {/* Section 1: Sales Breakdown by Category & Brand */}
      <div className="space-y-4 pt-4 border-t border-gray-200/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-emerald-600" />
              Cơ Cấu Doanh Thu Sinh Thái
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Sales Breakdown */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between border-b pb-3 border-gray-100">
              <span>Doanh số theo Danh Mục</span>
              <span className="text-emerald-600 font-black">{categorySales.length} Danh mục</span>
            </h3>

            {categorySales.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">Chưa có dữ liệu danh mục.</p>
            ) : (
              <div className="space-y-4">
                {categorySales.map((cat) => (
                  <div key={cat.categoryId} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">{cat.categoryName}</span>
                      <div className="text-right">
                        <span className="font-black text-emerald-700">
                          {formatCurrency(cat.revenue)}
                        </span>{' '}
                        <span className="text-[11px] text-slate-400">
                          ({cat.percentage?.toFixed(1)}% • {cat.quantitySold} SP)
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(cat.percentage || 0, 3)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Brand Sales Breakdown */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between border-b pb-3 border-gray-100">
              <span>Doanh số theo Thương Hiệu</span>
              <span className="text-teal-600 font-black">{brandSales.length} Thương hiệu</span>
            </h3>

            {brandSales.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">Chưa có dữ liệu thương hiệu.</p>
            ) : (
              <div className="space-y-4">
                {brandSales.map((brand) => (
                  <div key={brand.brandId} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">{brand.brandName}</span>
                      <div className="text-right">
                        <span className="font-black text-teal-700">
                          {formatCurrency(brand.revenue)}
                        </span>{' '}
                        <span className="text-[11px] text-slate-400">
                          ({brand.percentage?.toFixed(1)}% • {brand.quantitySold} SP)
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(brand.percentage || 0, 3)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Customer Retention & Churn Risk */}
      <div className="space-y-4 pt-4 border-t border-gray-200/60">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-600" />
            Sức Khỏe Khách Hàng & Nguy Cơ Rời Bỏ 
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Retention KPI Card (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tỷ Lệ Mua Lại (Repeat Rate)
              </span>
              <div className="text-3xl font-black text-purple-700 mt-2 flex items-baseline gap-1">
                <span>
                  {customerInsights?.repeatPurchaseRate
                    ? (customerInsights.repeatPurchaseRate * 100).toFixed(1)
                    : '0.0'}
                  %
                </span>
                <Percent className="w-4 h-4 text-purple-400" />
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-gray-100 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Khách hàng hoạt động:</span>
                <strong className="text-slate-900">{customerInsights?.activeCustomers || 0}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Khách mua hàng thực tế:</span>
                <strong className="text-slate-900">{customerInsights?.payingCustomers || 0}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Khách hàng mua lại (VIP):</span>
                <strong className="text-purple-700">{customerInsights?.repeatCustomers || 0}</strong>
              </div>
            </div>
          </div>

          {/* High Risk Churn Customers Table (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Khách Hàng Có Nguy Cơ Rời Bỏ (&gt; 30 Ngày Chưa Mua)
              </h3>
            </div>

            {!customerInsights?.highRiskCustomers || customerInsights.highRiskCustomers.length === 0 ? (
              <p className="text-xs text-emerald-600 font-bold py-8 text-center flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Không có khách hàng nào có nguy cơ cao.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="px-4 py-2.5 rounded-l-xl">Khách Hàng</th>
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5 text-center">Số Ngày Vắng Mặt</th>
                      <th className="px-4 py-2.5 text-center">Số Đơn Đã Mua</th>
                      <th className="px-4 py-2.5 text-right rounded-r-xl">Tổng Chi Tiêu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customerInsights.highRiskCustomers.slice(0, 5).map((c) => (
                      <tr key={c.userId} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-bold text-slate-900">{c.fullName}</td>
                        <td className="px-4 py-3 text-slate-500">{c.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                              c.daysSinceLastOrder > 30
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {c.daysSinceLastOrder} ngày
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-slate-700">
                          {c.totalOrders}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-emerald-700">
                          {formatCurrency(c.totalSpent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: CSAT Intelligence & Review Quality */}
      <div className="space-y-4 pt-4 border-t border-gray-200/60">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            Chỉ Số Hài Lòng Khách Hàng & Đánh Giá Nền Tảng (CSAT Intelligence)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Average Rating Score Card */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-3xl p-6 shadow-md space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-amber-100 text-xs font-bold uppercase tracking-wider">
                Điểm CSAT Nền Tảng
              </span>
              <div className="text-4xl font-black mt-2">
                {reviewInsights?.averagePlatformRating
                  ? reviewInsights.averagePlatformRating.toFixed(1)
                  : '0.0'}{' '}
                <span className="text-xl font-normal text-amber-200">/ 5.0</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-amber-200 text-xs pt-3 border-t border-amber-400/40">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(reviewInsights?.averagePlatformRating || 0)
                      ? 'fill-white text-white'
                      : 'text-amber-300/40'
                  }`}
                />
              ))}
              <span className="ml-1.5 font-bold text-white">
                {(reviewInsights?.averagePlatformRating || 0) >= 4.5
                  ? 'Xuất sắc'
                  : (reviewInsights?.averagePlatformRating || 0) >= 3.5
                  ? 'Tốt'
                  : reviewInsights?.totalReviews
                  ? 'Cần cải thiện'
                  : 'Chưa có dữ liệu'}
              </span>
            </div>
          </div>

          {/* Satisfaction Rate Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tỷ Lệ Khách Hài Lòng
              </span>
              <div className="text-3xl font-black text-emerald-600 mt-2">
                {reviewInsights?.satisfactionRate != null
                  ? reviewInsights.satisfactionRate.toFixed(1)
                  : '0.0'}
                %
              </div>
              <p className="text-xs text-slate-500 mt-1">Đánh giá 4-5 sao trên toàn hệ thống</p>
            </div>
            <div className="text-[11px] text-emerald-600 font-bold pt-3 border-t border-gray-100">
              ✓ Đạt chuẩn cam kết chất lượng EcoMart
            </div>
          </div>

          {/* Total Reviews Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tổng Số Đánh Giá
              </span>
              <div className="text-3xl font-black text-slate-900 mt-2">
                {reviewInsights?.totalReviews || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Được gửi từ người mua thực tế</p>
            </div>
            <div className="flex justify-between text-xs pt-3 border-t border-gray-100 text-slate-600">
              <span>Đang hiển thị: <strong className="text-emerald-700">{reviewInsights?.visibleReviews || 0}</strong></span>
              <span>Đã ẩn: <strong className="text-slate-500">{reviewInsights?.hiddenReviews || 0}</strong></span>
            </div>
          </div>

          {/* Quick Review Moderation Link */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Kiểm Duyệt Nội Dung
              </span>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Kiểm tra các nhận xét mới và xử lý những đánh giá có dấu hiệu vi phạm hoặc khiếu nại.
              </p>
            </div>
            <Link
              to={`${opsBase}/reviews`}
              tabIndex={0}
              aria-label="Truy cập trang Quản lý đánh giá"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs text-center transition-colors shadow-sm"
            >
              Vào Quản Lý Đánh Giá →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;
