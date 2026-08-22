import { AxiosError } from 'axios';

/**
 * Cấu trúc Response chuẩn từ Spring Boot Backend
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode?: string;
}

/**
 * Cấu trúc Error Response chuẩn RFC 7807 từ GlobalExceptionHandler
 */
export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errorCode?: string;
  errors?: Record<string, string>;
  timestamp?: string;
}

/**
 * Type-safe Axios Error với payload lỗi từ Backend
 */
export type CustomAxiosError = AxiosError<ApiErrorResponse>;

/**
 * Cấu trúc Phân trang dữ liệu từ Spring Boot PageResponse
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PageResponse<T> {
  items?: T[];
  pagination?: PaginationMeta;
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/**
 * Thực thể Sản phẩm trong Giỏ hàng (Dữ liệu thô từ Backend)
 */
export interface CartItem {
  id: number; // cartItemId
  productId: number;
  productName: string;
  productImageUrl?: string;
  sellingPrice: number;
  originalPrice?: number;
  quantity: number;
  quantityInStock: number;
  isAvailable: boolean;
  isVisible?: boolean;
}

/**
 * Thực thể Giỏ hàng (Chỉ chứa id và mảng items, các giá trị khác Frontend tự tính)
 */
export interface Cart {
  id: number;
  items: CartItem[];
  updatedAt?: string;
}

/**
 * Context Interface cho Giỏ hàng
 */
export interface CartContextType {
  cart: Cart | null;
  cartItems: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  loading: boolean;
  fetchCart: () => Promise<void>;
  handleAddToCart: (productId: number, quantity?: number) => Promise<boolean>;
  handleLocalQuantityChange: (cartItemId: number, newQuantity: number) => void;
  handleRemoveFromCart: (cartItemId: number) => Promise<void>;
  handleClearCart: () => Promise<void>;
}

// ==========================================
// MODULE 8: ORDER MANAGEMENT TYPES
// ==========================================

/**
 * Enum trạng thái đơn hàng
 */
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

/**
 * Enum phương thức thanh toán
 */
export type PaymentMethod = 'COD' | 'VNPAY' | 'SEPAY';

/**
 * Enum trạng thái thanh toán
 */
export type PaymentStatus = 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED';

/**
 * Sản phẩm trong đơn hàng (snapshot giá tại thời điểm đặt)
 */
export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

/**
 * Giao dịch thanh toán liên kết với đơn hàng
 */
export interface PaymentTransaction {
  id: number;
  paymentRef: string;
  gateway: string;
  amount: number;
  gatewayTransactionNo?: string;
  status: string;
  createdAt: string;
}

/**
 * Thực thể Đơn hàng đầy đủ
 */
export interface Order {
  id: number;
  orderCode: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  cancellationReason?: string;
  orderedAt?: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  paidAt?: string;
  items: OrderItem[];
  paymentTransactions: PaymentTransaction[];
}

/**
 * Payload tạo đơn hàng mới
 */
export interface CreateOrderPayload {
  addressId: number;
  paymentMethod: PaymentMethod;
}

/**
 * Response khi tạo đơn hàng thành công
 */
export interface CreateOrderResponse {
  order: Order;
  paymentUrl?: string;
}

/**
 * Params lọc đơn hàng Admin
 */
export interface AdminOrderFilterParams {
  keyword?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
}

/**
 * Request hủy đơn hàng Admin (kèm lý do)
 */
export interface AdminCancelOrderPayload {
  cancellationReason: string;
}

/**
 * Request cập nhật trạng thái thanh toán Admin
 */
export interface UpdatePaymentStatusPayload {
  paymentStatus: PaymentStatus;
}


/**
 * Thực thể Người dùng
 */
export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: 'CUSTOMER' | 'ADMIN';
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt?: string;
}

/**
 * Dữ liệu trả về khi Đăng nhập / Xác thực OTP thành công
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

/**
 * Payload Đăng nhập
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Payload Đăng ký tài khoản
 */
export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

/**
 * Response sau khi gọi đăng ký tài khoản
 */
export interface RegisterResponse {
  email: string;
  message: string;
  otpCode?: string;
}

/**
 * Payload Xác thực OTP Kích hoạt Email
 */
export interface VerifyEmailPayload {
  email: string;
  otpCode: string;
}

/**
 * Payload Gửi lại mã OTP
 */
export interface ResendOtpPayload {
  email: string;
}

/**
 * Payload Cấp mới Access Token
 */
export interface RefreshTokenPayload {
  refreshToken: string;
}

/**
 * Payload Yêu cầu Quên mật khẩu
 */
export interface ForgotPasswordPayload {
  email: string;
}

/**
 * Response sau khi yêu cầu Quên mật khẩu
 */
export interface ForgotPasswordResponse {
  email: string;
  message: string;
  resetToken?: string;
}

/**
 * Payload Đặt lại mật khẩu bằng mã OTP
 */
export interface ResetPasswordOtpPayload {
  email: string;
  otpCode: string;
  newPassword: string;
}

/**
 * Trạng thái Auth State trong AuthProvider
 */
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

/**
 * Discriminated Union cho các Auth Actions
 */
export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'LOGOUT' };

/**
 * Kiểu thông báo Toast
 */
export type ToastType = 'success' | 'error' | 'warning';

/**
 * Đối tượng Toast trong danh sách thông báo
 */
export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

/**
 * Context Interface cho hệ thống Toast
 */
export interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

// ==========================================
// MODULE 2: USER PROFILE & ADMIN USERS TYPES
// ==========================================

/**
 * Payload Cập nhật thông tin cá nhân
 */
export interface UpdateProfilePayload {
  fullName: string;
  phoneNumber?: string;
}

/**
 * Payload Đổi mật khẩu
 */
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Payload Khóa / Mở khóa tài khoản người dùng
 */
export interface UpdateUserStatusPayload {
  isActive: boolean;
}

/**
 * Tham số lọc danh sách người dùng cho Admin
 */
export interface AdminUsersFilterParams {
  keyword?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

// ==========================================
// MODULE 3: ADDRESS MANAGEMENT TYPES
// ==========================================

/**
 * Thực thể Địa chỉ nhận hàng
 */
export interface Address {
  id: number;
  recipientName: string;
  recipientPhone: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Aliases cho các component cũ nếu có
  receiverName?: string;
  receiverPhone?: string;
  detailAddress?: string;
}

/**
 * Payload Thêm / Sửa địa chỉ nhận hàng
 */
export interface AddressPayload {
  recipientName: string;
  recipientPhone: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  isDefault?: boolean;
  // Aliases
  receiverName?: string;
  receiverPhone?: string;
  detailAddress?: string;
}

// ==========================================
// MODULE 4: CATEGORY MANAGEMENT TYPES
// ==========================================

/**
 * Thực thể Danh mục sản phẩm
 */
export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload Thêm / Sửa Danh mục sản phẩm
 */
export interface CategoryPayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

// ==========================================
// MODULE 5: BRAND MANAGEMENT TYPES
// ==========================================

/**
 * Thực thể Thương hiệu đối tác
 */
export interface Brand {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload Thêm / Sửa Thương hiệu
 */
export interface BrandPayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

// ==========================================
// MODULE 6: PRODUCT & CERTIFICATION TYPES
// ==========================================

/**
 * Thực thể Hình ảnh sản phẩm
 */
export interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
  createdAt?: string;
}

/**
 * Payload Thêm / Sửa hình ảnh sản phẩm
 */
export interface ProductImagePayload {
  url: string;
  isPrimary?: boolean;
  displayOrder?: number;
}

/**
 * Thực thể Chứng nhận sinh thái (Eco Certification)
 */
export interface Certification {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload Thêm / Sửa Chứng nhận sinh thái
 */
export interface CertificationPayload {
  name: string;
  description?: string;
  iconUrl?: string;
  isActive?: boolean;
}

/**
 * Thực thể Sản phẩm (Product)
 */
export interface Product {
  id: number;
  name: string;
  description?: string;
  sellingPrice: number;
  originalPrice?: number;
  ecoScore: number; // 1 to 5
  materialInfo?: string;
  isVisible: boolean;
  category: Category;
  brand: Brand;
  certifications?: Certification[];
  images?: ProductImage[];
  quantityInStock: number;
  createdAt: string;
  updatedAt: string;
  // Fallbacks
  averageRating?: number;
  reviewCount?: number;
}

/**
 * Payload Thêm / Sửa Sản phẩm
 */
export interface ProductPayload {
  name: string;
  categoryId: number;
  brandId: number;
  sellingPrice: number;
  originalPrice?: number;
  ecoScore?: number;
  materialInfo?: string;
  certificationIds?: number[];
  description?: string;
  isVisible?: boolean;
  quantityInStock?: number;
  images?: ProductImagePayload[];
}

/**
 * Tham số lọc sản phẩm cho Khách hàng (Public Catalog)
  isActive: boolean;
}

/**
 * Tham số lọc danh sách người dùng cho Admin
 */
export interface AdminUsersFilterParams {
  keyword?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

// ==========================================
// MODULE 3: ADDRESS MANAGEMENT TYPES
// ==========================================

/**
 * Thực thể Địa chỉ nhận hàng
 */
export interface Address {
  id: number;
  recipientName: string;
  recipientPhone: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Aliases cho các component cũ nếu có
  receiverName?: string;
  receiverPhone?: string;
  detailAddress?: string;
}

/**
 * Payload Thêm / Sửa địa chỉ nhận hàng
 */
export interface AddressPayload {
  recipientName: string;
  recipientPhone: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  isDefault?: boolean;
  // Aliases
  receiverName?: string;
  receiverPhone?: string;
  detailAddress?: string;
}

// ==========================================
// MODULE 4: CATEGORY MANAGEMENT TYPES
// ==========================================

/**
 * Thực thể Danh mục sản phẩm
 */
export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload Thêm / Sửa Danh mục sản phẩm
 */
export interface CategoryPayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

// ==========================================
// MODULE 5: BRAND MANAGEMENT TYPES
// ==========================================

/**
 * Thực thể Thương hiệu đối tác
 */
export interface Brand {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload Thêm / Sửa Thương hiệu
 */
export interface BrandPayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

// ==========================================
// MODULE 6: PRODUCT & CERTIFICATION TYPES
// ==========================================

/**
 * Thực thể Hình ảnh sản phẩm
 */
export interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
  createdAt?: string;
}

/**
 * Payload Thêm / Sửa hình ảnh sản phẩm
 */
export interface ProductImagePayload {
  url: string;
  isPrimary?: boolean;
  displayOrder?: number;
}

/**
 * Thực thể Chứng nhận sinh thái (Eco Certification)
 */
export interface Certification {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload Thêm / Sửa Chứng nhận sinh thái
 */
export interface CertificationPayload {
  name: string;
  description?: string;
  iconUrl?: string;
  isActive?: boolean;
}

/**
 * Thực thể Sản phẩm (Product)
 */
export interface Product {
  id: number;
  name: string;
  description?: string;
  sellingPrice: number;
  originalPrice?: number;
  ecoScore: number; // 1 to 5
  materialInfo?: string;
  isVisible: boolean;
  category: Category;
  brand: Brand;
  certifications?: Certification[];
  images?: ProductImage[];
  quantityInStock: number;
  createdAt: string;
  updatedAt: string;
  // Fallbacks
  averageRating?: number;
  reviewCount?: number;
}

/**
 * Payload Thêm / Sửa Sản phẩm
 */
export interface ProductPayload {
  name: string;
  categoryId: number;
  brandId: number;
  sellingPrice: number;
  originalPrice?: number;
  ecoScore?: number;
  materialInfo?: string;
  certificationIds?: number[];
  description?: string;
  isVisible?: boolean;
  quantityInStock?: number;
  images?: ProductImagePayload[];
}

/**
 * Tham số lọc sản phẩm cho Khách hàng (Public Catalog)
 */
export interface ProductFilterParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: number;
  brandId?: number;
  certificationId?: number;
  minPrice?: number;
  maxPrice?: number;
  minEcoScore?: number;
  sort?: string;
}

/**
 * Tham số lọc sản phẩm cho Admin
 */
export interface AdminProductFilterParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: number;
  brandId?: number;
  isVisible?: boolean;
}

// ==========================================
// MODULE 9: REVIEW, REPORT & INVENTORY TYPES
// ==========================================

/**
 * Thực thể Đánh giá sản phẩm (Review)
 */
export interface Review {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  orderItemId: number;
  userId: number;
  userFullName: string;
  rating: number; // 1 - 5
  comment?: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Phân bổ số sao đánh giá
 */
export interface RatingBreakdown {
  star5: number;
  star4: number;
  star3: number;
  star2: number;
  star1: number;
}

/**
 * Tổng quan đánh giá sản phẩm (Public summary)
 */
export interface ProductReviewSummary {
  averageRating: number;
  reviewCount: number;
  ratingBreakdown: RatingBreakdown;
  reviews: PageResponse<Review>;
}

/**
 * Payload tạo đánh giá mới (Customer)
 */
export interface CreateReviewPayload {
  orderItemId: number;
  rating: number;
  comment?: string;
}

/**
 * Payload cập nhật đánh giá (Customer)
 */
export interface UpdateReviewPayload {
  rating: number;
  comment?: string;
}

/**
 * Payload cập nhật trạng thái hiển thị đánh giá (Admin)
 */
export interface UpdateReviewVisibilityPayload {
  isVisible: boolean;
}

/**
 * Tham số lọc đánh giá cho Admin
 */
export interface AdminReviewFilterParams {
  page?: number;
  pageSize?: number;
  productId?: number;
  rating?: number;
  isVisible?: boolean;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
}

// --- REPORTS & DASHBOARD ---

export type ReportGroupBy = 'DAY' | 'MONTH' | 'YEAR';

/**
 * Thống kê tổng quan Dashboard Admin
 */
export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  newContactMessages: number;
  recentOrders: Order[];
}

/**
 * Điểm dữ liệu doanh thu theo kỳ
 */
export interface RevenuePeriodData {
  period: string;
  revenue: number;
  orderCount: number;
}

/**
 * Báo cáo doanh thu
 */
export interface RevenueReport {
  totalRevenue: number;
  totalCompletedOrders: number;
  averageOrderValue: number;
  groupBy: ReportGroupBy;
  fromDate?: string;
  toDate?: string;
  items: RevenuePeriodData[];
}

/**
 * Top sản phẩm bán chạy
 */
export interface TopSellingProduct {
  productId: number;
  productName: string;
  productImageUrl?: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

/**
 * Doanh số theo danh mục
 */
export interface CategorySales {
  categoryId: number;
  categoryName: string;
  quantitySold: number;
  revenue: number;
  percentage: number;
}

/**
 * Doanh số theo thương hiệu
 */
export interface BrandSales {
  brandId: number;
  brandName: string;
  quantitySold: number;
  revenue: number;
  percentage: number;
}

/**
 * Cơ cấu phương thức thanh toán
 */
export interface PaymentMethodStats {
  paymentMethod: PaymentMethod;
  orderCount: number;
  totalAmount: number;
  percentage: number;
}

/**
 * Cảnh báo tồn kho
 */
export interface InventoryAlert {
  productId: number;
  productName: string;
  categoryName: string;
  currentStock: number;
  sellingPrice: number;
  isOutOfStock: boolean;
}

/**
 * Thống kê tác động sinh thái
 */
export interface EcoImpact {
  averageEcoScore: number;
  certifiedProductsSold: number;
  highEcoScoreProductsSold: number;
}

/**
 * Khách hàng VIP chi tiêu cao
 */
export interface TopCustomer {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  completedOrdersCount: number;
  totalSpent: number;
}

/**
 * Phân tích sức khỏe khách hàng
 */
export interface CustomerInsights {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  payingCustomers: number;
  repeatCustomers: number;
  repeatPurchaseRate: number;
  highRiskCustomers?: {
    userId: number;
    fullName: string;
    email: string;
    daysSinceLastOrder: number;
    totalOrders: number;
    totalSpent: number;
  }[];
}

// --- INVENTORY MANAGEMENT ---

/**
 * Thực thể Tồn kho sản phẩm
 */
export interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  quantityInStock: number;
  updatedAt?: string;
}

/**
 * Payload cập nhật số lượng tồn kho
 */
export interface UpdateInventoryPayload {
  quantityInStock: number;
}

// --- PAYMENT RETURN ---

/**
 * Kết quả trả về sau giao dịch VNPay
 */
export interface VNPayReturnResponse {
  orderCode: string;
  transactionNo: string;
  amount: number;
  bankCode: string;
  cardType?: string;
  orderInfo?: string;
  payDate: string;
  responseCode: string;
  isSuccess: boolean;
  message: string;
}

export interface CustomerGrowthData {
  period: string;
  newCustomersCount: number;
}

export interface CustomerGrowthResponse {
  totalNewCustomers: number;
  groupBy: ReportGroupBy;
  fromDate?: string;
  toDate?: string;
  items: CustomerGrowthData[];
}

export interface ReviewInsightsResponse {
  totalReviews: number;
  visibleReviews: number;
  hiddenReviews: number;
  averagePlatformRating: number;
  satisfactionRate: number;
  ratingDistribution?: Record<number, number>;
}

// ==========================================
// MODULE 10: CONTENT, CONTACT & STORE SETTINGS
// ==========================================

/**
 * Cấu hình thông tin cửa hàng
 */
export interface StoreSetting {
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  mapEmbedUrl: string;
}

/**
 * Payload cập nhật cấu hình cửa hàng
 */
export interface UpdateStoreSettingPayload {
  storePhone?: string;
  storeEmail?: string;
  storeAddress?: string;
  mapEmbedUrl?: string;
}

/**
 * Trang nội dung / chính sách
 */
export interface ContentPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

/**
 * Payload cập nhật trang nội dung
 */
export interface UpdateContentPagePayload {
  title: string;
  content: string;
}

/**
 * Trạng thái xử lý tin nhắn liên hệ
 */
export type ContactStatus = 'PENDING' | 'RESOLVED';

/**
 * Tin nhắn liên hệ của khách hàng
 */
export interface ContactMessage {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  content: string;
  status: ContactStatus;
  createdAt: string;
  resolvedAt?: string | null;
}

/**
 * Payload gửi tin nhắn liên hệ
 */
export interface CreateContactMessagePayload {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  content: string;
}

/**
 * Tham số lọc tin nhắn liên hệ cho Admin
 */
export interface AdminContactFilterParams {
  page?: number;
  pageSize?: number;
  status?: ContactStatus;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
}

// ==========================================
// MODULE 12: INVENTORY & PAYMENT RETURN TYPES
// ==========================================

/**
 * Mục tồn kho sản phẩm trong kho Admin
 */
export interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  categoryName?: string;
  sellingPrice?: number;
  quantityInStock: number;
  updatedAt?: string;
}

/**
 * Payload cập nhật số lượng tồn kho
 */
export interface UpdateInventoryPayload {
  quantityInStock: number;
}

/**
 * Tham số lọc danh sách tồn kho
 */
export interface AdminInventoryFilterParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  lowStockOnly?: boolean;
}

