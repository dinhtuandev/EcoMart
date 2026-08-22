# 📋 EcoMart Frontend — Danh Sách Kiểm Tra Triển Khai (Module Checklist)

> **Quy tắc thực hiện**:
> - Mỗi phân hệ (Module) được triển khai riêng biệt, kiểm tra hoàn chỉnh trước khi chuyển sang module tiếp theo.
> - Sau khi hoàn tất mỗi Module: Thực hiện kiểm tra giao diện, xác thực gọi API, kiểm tra responsive và **tạo 1 commit riêng biệt rõ ràng** (theo chuẩn Conventional Commits).
> - Mã nguồn tuân thủ: React 18, React Router v6, TailwindCSS, Axios Interceptor (Refresh Token), Lucide Icons, xử lý Loading/Empty/Error states và Accessibility (a11y).

---

## 🛠️ Giai Đoạn 0: Core Infrastructure & State Architecture
- [x] **0.1. Axios Client & Interceptor (`src/lib/axiosClient.ts`)**:
  - [x] Base URL cấu hình linh hoạt từ `VITE_API_URL` (mặc định `http://localhost:8081/api/v1`).
  - [x] Request Interceptor: Tự động đính kèm header `Authorization: Bearer <accessToken>`.
  - [x] Response Interceptor: Bắt lỗi 401 tự động gọi `POST /api/v1/auth/refresh-token` với hàng đợi `failedQueue` để cấp lại `accessToken` mới mà không ngắt quãng phiên người dùng.
  - [x] Bắt lỗi 429: Hiển thị Toast cảnh báo Cooldown / Rate Limit kèm đếm ngược.
  - [x] Xử lý định dạng lỗi chuẩn RFC 7807 (`{ success: false, message: "..." }`).
- [x] **0.2. Toast Notification Context (`src/context/ToastContext.tsx` & `src/components/ui/ToastContainer.tsx`)**:
  - [x] Hệ thống Toast góc trên màn hình (Success, Error, Warning, Info) có animation và tự đóng sau 3.0s.
- [x] **0.3. Master Layouts & Routing (`src/routes/AppRoutes.jsx`)**:
  - [x] `MainLayout.jsx`: Header, Navigation Bar, Breadcrumb, Footer.
  - [x] `AdminLayout.jsx`: Sidebar điều hướng quản trị 12 modules, Topbar, Profile Menu.
  - [x] Route Guards: `ProtectedRoute` với `isLoading` chống Flash UI.

---

## 🔐 Module 1: Auth & Security Core + Email OTP & Anti-Spam
- [x] **1.1. API Service & State**:
  - [x] `src/services/authApi.ts`: `register`, `verifyEmail`, `resendOtp`, `login`, `refreshToken`, `forgotPassword`, `resetPasswordOtp`, `getMe`.
  - [x] `src/providers/AuthProvider.tsx`: Quản lý `currentUser`, `accessToken`, `refreshToken`, `role`, `useReducer` chuẩn SaaS.
- [x] **1.2. Màn hình & Components**:
  - [x] `src/pages/LoginPage.tsx`: Đăng nhập bằng Email/Password, validation, phân luồng điều hướng theo Role (`ADMIN` $\to$ `/admin`, `CUSTOMER` $\to$ `/`).
  - [x] `src/pages/RegisterPage.tsx`: Form đăng ký Customer $\to$ Mở **Modal Nhập Mã OTP 6 Số** (Resend API) với đếm ngược 60 giây và cảnh báo tối đa 5 lần thử.
  - [x] `src/components/auth/OtpInput.tsx` & `src/components/auth/OtpVerificationModal.tsx`: 6 ô số, regex parse 429 cooldown.
  - [x] `src/pages/ForgotPasswordPage.tsx`: Luồng 2 bước: Nhập email nhận OTP $\to$ Nhập OTP và mật khẩu mới.
- [x] **Git Commit**: `feat(fe-auth): Implement Module 1 Auth, Resend Email OTP verification, anti-spam and refresh token`

---

## 👤 Module 2: User Profile Management
- [x] **2.1. API Service**:
  - [x] `src/services/userApi.ts`: `getProfile`, `updateProfile`, `changePassword`, `adminGetUsers`, `adminUpdateUserStatus`.
- [x] **2.2. Màn hình Khách Hàng & Quản Trị**:
  - [x] `src/pages/ProfilePage.tsx`: Xem & cập nhật thông tin cá nhân (Họ tên, SĐT, Email hiển thị readonly kèm badge "Đã xác thực"), Form đổi mật khẩu bảo mật.
  - [x] `src/pages/admin/AdminUserPage.tsx`: Bảng danh sách khách hàng, tìm kiếm theo tên/email debounce 500ms, toggle trạng thái hoạt động (`isActive`) với Optimistic Update.
- [x] **Git Commit**: `feat(fe-user): Implement Module 2 User profile, change password and admin user management`

---

## 📍 Module 3: Address Book Management
- [x] **3.1. API Service**:
  - [x] `src/services/addressApi.ts`: `getAddresses`, `createAddress`, `updateAddress`, `deleteAddress`.
  - [x] `src/services/locationApi.ts`: Tích hợp Vietnam Provinces API chuẩn phân cấp `depth=2` cho 63 Tỉnh/Thành $\to$ Quận/Huyện $\to$ Phường/Xã.
- [x] **3.2. Màn hình & Components**:
  - [x] `src/components/address/AddressModal.tsx`: Modal thêm/sửa địa chỉ với 3 Dropdown phân cấp (Tỉnh $\to$ Quận $\to$ Phường), validate SĐT VN, Checkbox đặt làm mặc định.
  - [x] `src/components/address/AddressCard.tsx`: Thẻ hiển thị địa chỉ có badge "Mặc định", nút Sửa & Xóa có xác nhận an toàn.
  - [x] `src/pages/ProfilePage.tsx` (Tab Sổ Địa Chỉ): Danh sách địa chỉ nhận hàng với Optimistic Update cho cờ `isDefault`.
- [x] **Git Commit**: `feat(fe-address): Implement Module 3 Address book management with Vietnam Provinces API`

---

## 📂 Module 4 & 5: Category & Brand Management
- [x] **4.1. API Services**:
  - [x] `src/services/categoryApi.ts`: `getCategories`, `adminGetCategories`, `adminCreateCategory`, `adminUpdateCategory`.
  - [x] `src/services/brandApi.ts`: `getBrands`, `adminGetBrands`, `adminCreateBrand`, `adminUpdateBrand`.
  - [x] `src/hooks/usePublicCategories.ts` & `src/hooks/usePublicBrands.ts`: In-memory caching chống gọi API lặp.
- [x] **4.2. Giao diện Người Dùng & Admin**:
  - [x] `src/components/layout/Header.tsx`: Menu điều hướng và Dropdown danh mục sinh thái phân cấp.
  - [x] `src/pages/admin/AdminCategoryPage.tsx`: 3 Cards thống kê, Debounce 300ms search, filter tabs, bảng xen kẽ màu, Optimistic Update toggle `isActive`, CategoryModal.
  - [x] `src/pages/admin/AdminBrandPage.tsx`: 3 Cards thống kê, Debounce 300ms search, filter tabs, bảng xen kẽ màu, Optimistic Update toggle `isActive`, BrandModal.
  - [x] `src/components/layout/AdminSidebar.tsx`: Menu item `Quản lý Danh mục` (`FolderTree`) và `Quản lý Thương hiệu` (`Award`).
- [x] **Git Commits**:
  - `feat(fe-category): Implement Module 4 Category Management with Debounced Search and Optimistic status toggle`
  - `feat(fe-brand): Implement Module 5 Brand Management with Debounced Search and Optimistic status toggle`

---

## 🌿 Module 6: Product Catalog, Images, Inventory & Green Certifications
- [x] **6.1. API Services**:
  - [x] `src/services/productApi.ts`: `getProducts`, `getProductDetail`, `adminGetProducts`, `adminGetProductDetail`, `adminCreateProduct`, `adminUpdateProduct`, `adminUpdateProductImages`.
  - [x] `src/services/certificationApi.ts`: `getCertifications`, `adminGetCertifications`, `adminCreateCertification`, `adminUpdateCertification`.
  - [x] `src/hooks/usePublicCertifications.ts`: In-memory caching chống gọi lặp API.
- [x] **6.2. Màn hình Khách Hàng (Customer Portal)**:
  - [x] `src/components/product/EcoScoreBadge.tsx`: Badge hiển thị 1-5 lá xanh và mức độ sinh thái.
  - [x] `src/components/product/ProductCard.tsx`: Card sản phẩm hiện đại, thumbnail, giá bán, giá cũ gạch ngang (% giảm), Badge Eco-Score, tag chứng nhận, nút thêm giỏ nhanh.
  - [x] `src/pages/ProductListPage.tsx`: Bộ lọc Sidebar đa tiêu chí (Danh mục, Hãng, Chứng nhận Nhãn Xanh, Điểm Eco-Score 1-5, Khoảng giá), Sắp xếp, Phân trang Pagination, Global 300ms Debounced Search.
  - [x] `src/pages/ProductDetailPage.tsx`: Gallery ảnh thumbnail switcher, thông số vật liệu xanh, danh sách chứng nhận sinh thái, bộ chọn số lượng kiểm tra tồn kho, tabs mô tả.
- [x] **6.3. Màn hình Quản Trị (Admin Portal)**:
  - [x] `src/pages/admin/AdminProductPage.tsx`: 4 Cards KPI kho hàng, tìm kiếm debounce 300ms, lọc Category & Brand, table xen kẽ màu, toggle `isVisible` với Optimistic Update.
  - [x] `src/components/product/AdminProductModal.tsx`: Form thêm/sửa sản phẩm toàn diện (Tên, Giá, Giá gốc, Tồn kho, Điểm Eco-Score 1-5, Vật liệu, Multi-select Chứng nhận xanh, Danh sách URL ảnh).
  - [x] `src/pages/admin/AdminCertificationPage.tsx` & `CertificationModal.tsx`: CRUD chứng nhận sinh thái nhãn xanh (FSC, USDA, Fair Trade...).
- [x] **Git Commit**: `feat(fe-catalog): Implement Module 6 Product catalog, eco-score badges, details and green certification admin`

---

## 🛒 Module 7: Shopping Cart Management
- [ ] **7.1. API Service & State**:
  - [ ] `src/services/cartApi.js`: `getCart`, `addToCart`, `updateCartItem`, `removeCartItem`, `clearCart`.
  - [ ] `src/context/CartContext.jsx`: Lưu trữ giỏ hàng, đồng bộ realtime khi thêm/sửa/xóa, tính tổng tiền, kiểm tra tồn kho.
- [ ] **7.2. Giao diện**:
  - [ ] Header: Icon giỏ hàng với badge số lượng cập nhật tức thì.
  - [ ] `src/pages/CartPage.jsx`: Bảng sản phẩm trong giỏ, bộ tăng/giảm số lượng (Stepper) giới hạn theo tồn kho, checkbox chọn sản phẩm để thanh toán, xóa từng món hoặc xóa tất cả, bảng tóm tắt đơn hàng.
- [ ] **Git Commit**: `feat(fe-cart): Implement Module 7 Shopping cart management with realtime stock sync`

---

## 📦 Module 8: Order Management & Checkout
- [ ] **8.1. API Service**:
  - [ ] `src/services/orderApi.js`: `checkout`, `getMyOrders`, `getOrderByCode`, `cancelOrder`, `adminGetOrders`, `adminUpdateOrderStatus`, `adminCancelOrder`.
- [ ] **8.2. Màn hình Khách Hàng**:
  - [ ] `src/pages/CheckoutPage.jsx`: Chọn địa chỉ nhận hàng, xem lại danh sách mua & giá snapshot, chọn phương thức thanh toán (`COD`, `SEPAY_BANK_TRANSFER`, `VNPAY`), nút "Xác nhận đặt hàng".
  - [ ] `src/pages/OrderHistoryPage.jsx`: Danh sách đơn hàng phân theo Tab trạng thái (`Tất cả`, `Chờ xác nhận`, `Đã xác nhận`, `Đang giao`, `Hoàn thành`, `Đã hủy`).
  - [ ] `src/pages/OrderDetailPage.jsx`: Thông tin chi tiết đơn hàng, Stepper tiến trình đơn, bảng sản phẩm đã mua, nút **"Hủy đơn hàng"** khi đơn còn `PENDING`.
- [ ] **8.3. Màn hình Quản Trị**:
  - [ ] `src/pages/admin/AdminOrderPage.jsx`: Danh sách đơn hàng, lọc theo trạng thái xử lý & thanh toán, cập nhật trạng thái (`PENDING` $\to$ `CONFIRMED` $\to$ `SHIPPING` $\to$ `COMPLETED`), hủy đơn kèm lý do.
- [ ] **Git Commit**: `feat(fe-order): Implement Module 8 Order management, checkout flow, timeline and admin processing`

---

## 💳 Module 9: Payment Gateways (VNPay & SePay VietQR)
- [ ] **9.1. API Service & VietQR Modal**:
  - [ ] `src/services/paymentApi.js`: `getVNPayUrl`, `verifyVNPayReturn`, `getTransactionStatus`.
  - [ ] `src/components/payment/VietQrModal.jsx`:
    - Hiển thị ảnh mã QR Code Napas 247 động (`https://qr.sepay.vn/...`).
    - Hiển thị số tiền, số tài khoản, ngân hàng, nội dung chuyển khoản `EM-XXXXXXXX`.
    - Đồng hồ đếm ngược 15 phút.
    - Tự động Polling kiểm tra trạng thái thanh toán $\to$ Tự động chuyển sang trạng thái thành công khi nhận được webhook gạch nợ.
- [ ] **9.2. Màn hình Kết Quả**:
  - [ ] `src/pages/PaymentReturnPage.jsx`: Xử lý khi khách quay lại từ Cổng VNPay, gọi API xác thực chữ ký và hiển thị màn hình thông báo kết quả.
- [ ] **Git Commit**: `feat(fe-payment): Implement Module 9 Payment gateway integration with dynamic VietQR modal and VNPay return`

---

## ⭐ Module 10: Product Review Management
- [ ] **10.1. API Service**:
  - [ ] `src/services/reviewApi.js`: `createReview`, `getProductReviews`, `getMyReviews`, `adminGetReviews`, `adminToggleReview`.
- [ ] **10.2. Giao diện**:
  - [ ] `src/components/review/ReviewModal.jsx`: Modal cho phép khách đánh giá 1-5 sao và viết nhận xét cho sản phẩm trong đơn đã `COMPLETED`.
  - [ ] `src/components/review/ProductReviews.jsx`: Khối đánh giá trong trang chi tiết sản phẩm (Điểm CSAT trung bình, thanh tỷ lệ 1-5 sao, danh sách nhận xét có badge "Đã mua tại EcoMart").
  - [ ] `src/pages/admin/AdminReviewPage.jsx`: Bảng quản trị đánh giá, lọc theo số sao, nút ẩn/hiện đánh giá vi phạm.
- [ ] **Git Commit**: `feat(fe-review): Implement Module 10 Product review submission, display and admin moderation`

---

## 📝 Module 11: Content Pages, Contact & Store Settings
- [ ] **11.1. API Services**:
  - [ ] `src/services/contactApi.js`, `src/services/contentApi.js`, `src/services/storeSettingApi.js`.
- [ ] **11.2. Màn hình Khách Hàng**:
  - [ ] `src/pages/ContactPage.jsx`: Form gửi liên hệ/feedback + Thông tin cửa hàng (Hotline, Email, Địa chỉ) + Bản đồ Google Maps nhúng.
  - [ ] `src/pages/PolicyPage.jsx`: Đọc nội dung động 3 trang chính sách (`/policy/doi-tra`, `/policy/bao-hanh`, `/policy/van-chuyen`).
  - [ ] `src/components/common/Footer.jsx`: Liên kết các trang chính sách, thông tin sinh thái EcoMart.
- [ ] **11.3. Màn hình Quản Trị**:
  - [ ] `src/pages/admin/AdminContactPage.jsx`: Danh sách tin nhắn khách hàng gửi đến, xem chi tiết và đánh dấu đã xử lý.
  - [ ] `src/pages/admin/AdminContentPage.jsx`: Soạn thảo nội dung các trang chính sách.
  - [ ] `src/pages/admin/AdminStoreSettingPage.jsx`: Cập nhật Hotline, Email, Địa chỉ và đường dẫn nhúng Google Maps.
- [ ] **Git Commit**: `feat(fe-content): Implement Module 11 Contact form, dynamic policy pages and store settings admin`

---

## 📊 Module 12: Admin Dashboard & Intelligence Center
- [ ] **12.1. API Service**:
  - [ ] `src/services/reportApi.js`: Kết nối toàn bộ 12 APIs phân tích JPQL của Backend.
- [ ] **12.2. Giao diện Intelligence Center (`src/pages/admin/AdminDashboardPage.jsx`)**:
  - [ ] 4 Thẻ KPI: Doanh thu thực tế, Tổng đơn hàng hoàn thành, Khách hàng mới, Sản phẩm trong kho.
  - [ ] Biểu đồ Doanh thu chu kỳ (Bộ chuyển đổi `DAY`, `MONTH`, `YEAR`).
  - [ ] Bảng Top 10 sản phẩm bán chạy nhất (Doanh thu & Số lượng).
  - [ ] Biểu đồ tròn tỷ trọng doanh thu theo Danh mục & Thương hiệu.
  - [ ] Biểu đồ phân tích Phương thức thanh toán (COD vs VNPay vs SePay).
  - [ ] Biểu đồ Tăng trưởng khách hàng mới & Bảng Khách hàng VIP chi tiêu cao nhất.
  - [ ] Thẻ cảnh báo hành vi khách hàng & Nguy cơ hủy đơn hàng.
  - [ ] Bảng cảnh báo sản phẩm sắp hết hàng (Tồn kho $\le 10$).
  - [ ] Báo cáo mức độ hài lòng khách hàng CSAT & Cảnh báo review xấu ($\le 2$ sao).
  - [ ] Bộ đếm Tác động Sinh thái Eco-Impact (Sản phẩm xanh tiêu thụ).
- [ ] **Git Commit**: `feat(fe-report): Implement Module 12 Admin Dashboard and Intelligence Center with 12 JPQL APIs`

---

## 🏁 Giai Đoạn Cuối: Hoàn Thiện, Responsive & Build Verification
- [ ] Kiểm tra responsive toàn bộ ứng dụng trên Desktop, Tablet và Mobile.
- [ ] Kiểm tra toàn bộ luồng người dùng (E2E flows): Đăng ký OTP $\to$ Mua hàng $\to$ Quét VietQR $\to$ Giao hàng $\to$ Đánh giá.
- [ ] Chạy `npm run build` để xác nhận 0 lỗi cú pháp / type error.
- [ ] **Git Commit**: `chore: Complete frontend verification and production build`
