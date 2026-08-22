import axiosClient from '../lib/axiosClient';
import {
  ApiResponse,
  DashboardSummary,
  RevenueReport,
  ReportGroupBy,
  TopSellingProduct,
  CategorySales,
  BrandSales,
  PaymentMethodStats,
  InventoryAlert,
  EcoImpact,
  CustomerGrowthResponse,
  TopCustomer,
  CustomerInsights,
  ReviewInsightsResponse,
} from '../types';

/**
 * Service Báo cáo & Thống kê Admin (Report API)
 */
export const reportApi = {
  /**
   * Lấy dữ liệu tổng quan Dashboard
   */
  getDashboardSummary: (): Promise<ApiResponse<DashboardSummary>> =>
    axiosClient.get('/admin/reports/dashboard-summary'),

  /**
   * Lấy báo cáo doanh thu theo khoảng thời gian và nhóm (DAY / MONTH / YEAR)
   */
  getRevenueReport: (params?: {
    fromDate?: string;
    toDate?: string;
    groupBy?: ReportGroupBy;
  }): Promise<ApiResponse<RevenueReport>> =>
    axiosClient.get('/admin/reports/revenue', { params }),

  /**
   * Lấy top sản phẩm bán chạy nhất
   */
  getTopSellingProducts: (params?: {
    limit?: number;
    fromDate?: string;
    toDate?: string;
  }): Promise<ApiResponse<TopSellingProduct[]>> =>
    axiosClient.get('/admin/reports/top-selling-products', { params }),

  /**
   * Tỷ trọng doanh số theo danh mục
   */
  getSalesByCategory: (params?: {
    fromDate?: string;
    toDate?: string;
  }): Promise<ApiResponse<CategorySales[]>> =>
    axiosClient.get('/admin/reports/sales-by-category', { params }),

  /**
   * Tỷ trọng doanh số theo thương hiệu
   */
  getSalesByBrand: (params?: {
    fromDate?: string;
    toDate?: string;
  }): Promise<ApiResponse<BrandSales[]>> =>
    axiosClient.get('/admin/reports/sales-by-brand', { params }),

  /**
   * Cơ cấu phương thức thanh toán
   */
  getPaymentMethodStats: (params?: {
    fromDate?: string;
    toDate?: string;
  }): Promise<ApiResponse<PaymentMethodStats[]>> =>
    axiosClient.get('/admin/reports/payment-methods', { params }),

  /**
   * Cảnh báo tồn kho thấp / hết hàng
   */
  getInventoryAlerts: (threshold: number = 5): Promise<ApiResponse<InventoryAlert[]>> =>
    axiosClient.get('/admin/reports/inventory-alerts', { params: { threshold } }),

  /**
   * Báo cáo chất lượng đánh giá & mức độ hài lòng
   */
  getReviewInsights: (): Promise<ApiResponse<ReviewInsightsResponse>> =>
    axiosClient.get('/admin/reports/review-insights'),

  /**
   * Thống kê tác động sinh thái (Eco Impact)
   */
  getEcoImpact: (): Promise<ApiResponse<EcoImpact>> =>
    axiosClient.get('/admin/reports/eco-impact'),

  /**
   * Tăng trưởng khách hàng
   */
  getCustomerGrowth: (params?: {
    fromDate?: string;
    toDate?: string;
    groupBy?: ReportGroupBy;
  }): Promise<ApiResponse<CustomerGrowthResponse>> =>
    axiosClient.get('/admin/reports/customer-growth', { params }),

  /**
   * Top khách hàng VIP chi tiêu cao
   */
  getTopCustomers: (limit: number = 5): Promise<ApiResponse<TopCustomer[]>> =>
    axiosClient.get('/admin/reports/top-customers', { params: { limit } }),

  /**
   * Phân tích sức khỏe khách hàng và rủi ro rời bỏ
   */
  getCustomerInsights: (): Promise<ApiResponse<CustomerInsights>> =>
    axiosClient.get('/admin/reports/customer-insights'),
};

export default reportApi;
