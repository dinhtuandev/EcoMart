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


