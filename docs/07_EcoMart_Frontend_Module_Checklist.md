# EcoMart Frontend — Trạng thái triển khai thực tế

> **Trạng thái:** Đã đối chiếu với source trong `ecomart-frontend/src`, route frontend và controller Spring Boot ngày 08/09/2026. Đây là tài liệu hiện trạng, không phải kế hoạch sprint. Những mục không có route hoặc API tương ứng được ghi rõ là chưa triển khai.

## 1. Kiến trúc frontend

- **Stack:** React 18, TypeScript, Vite, React Router v6, Axios, Tailwind CSS và lucide-react.
- **Khởi tạo ứng dụng:** `src/main.tsx` mount `App`; `App.tsx` lồng `ToastProvider → AuthProvider → CartProvider → AppRoutes`.
- **API:** `src/lib/axiosClient.ts` dùng `VITE_API_BASE_URL`, mặc định `http://localhost:8081/api/v1`; tự gắn Bearer token và chỉ cho phép một refresh-token flow tại một thời điểm.
- **State dùng chung:** `AuthProvider` lưu phiên vào `localStorage`; `CartContext` đồng bộ giỏ hàng với backend và debounce cập nhật số lượng 500 ms; `ToastContext` hiển thị phản hồi UI.
- **Định tuyến:** `MainLayout` bọc khu vực khách; `AdminLayout` bọc khu vực vận hành. `ProtectedRoute` bảo vệ theo role ở frontend, nhưng backend vẫn là nguồn kiểm soát quyền chính.

## 2. Chức năng đã triển khai

| Phân hệ | Frontend đã có | API/backend liên quan |
|---|---|---|
| Xác thực | Đăng ký, modal OTP, đăng nhập, quên/đặt lại mật khẩu, khôi phục phiên, logout bắt buộc khi refresh token thất bại. | `/auth/register`, `/verify-email`, `/resend-verification`, `/login`, `/refresh-token`, `/forgot-password`, `/reset-password-otp`, `/auth/me`. |
| Social login | Nạp Google Identity Services/Facebook SDK, lấy cấu hình public và gửi token về backend. | `/auth/social-config`, `/auth/social-login`. |
| Catalog | Trang chủ, danh sách sản phẩm, tìm kiếm/lọc/sắp xếp/phân trang, chi tiết, Eco-Score, thương hiệu, danh mục, chứng nhận. | `/products`, `/categories`, `/brands`, `/certifications`. |
| Giỏ hàng | Thêm/xóa/xóa toàn bộ, optimistic UI, giới hạn tồn kho, cập nhật số lượng debounce. | `/cart`, `/cart/items`. |
| Checkout & đơn hàng | Checkout, lịch sử/chi tiết đơn, hủy đơn `PENDING`, thanh toán lại. | `/orders`, `/orders/{id}/cancel`, `/orders/{id}/retry-payment`. |
| Thanh toán | Trang kết quả VNPay, modal VietQR và trang giả lập VNPay dành cho dev. | `/payments/vnpay/return`, `/payments/mock/success`; webhook IPN/SePay do gateway gọi backend. |
| Hồ sơ & địa chỉ | Cập nhật profile, đổi mật khẩu, CRUD sổ địa chỉ. | `/me`, `/me/password`, `/me/addresses`. |
| Đánh giá | Hiển thị đánh giá sản phẩm, tạo/sửa review của khách, quản trị ẩn/hiện review. | `/products/{id}/reviews`, `/reviews`, `/me/reviews`, `/admin/reviews`. |
| Nội dung & liên hệ | Form contact, trang nội dung theo slug, footer/thông tin cửa hàng động. | `/contact-messages`, `/pages`, `/settings`. |
| Admin/Manager | Dashboard; danh mục, thương hiệu, sản phẩm/ảnh, kho, chứng nhận, đơn hàng, review, liên hệ, nội dung. | Nhóm `/admin/*`, với `ADMIN` hoặc `MANAGER` theo `SecurityConfig`. |
| Admin-only | Danh sách/khóa-mở khóa user và cập nhật thông tin cửa hàng. | `/admin/users`, `PATCH /admin/settings`. |

## 3. Route hiện có

### Public

`/`, `/login`, `/register`, `/forgot-password`, `/products`, `/products/:id`, `/cart`, `/contact`, `/pages/:slug`, `/payment/vnpay/return`, `/payment/vnpay/mock`.

### Customer (yêu cầu đăng nhập)

`/checkout`, `/orders`, `/orders/:id`, `/profile`.

### Admin hoặc Manager

`/admin`, `/admin/categories`, `/admin/brands`, `/admin/products`, `/admin/inventory`, `/admin/certifications`, `/admin/orders`, `/admin/orders/:id`, `/admin/reviews`, `/admin/content`.

### Chỉ Admin

`/admin/users`, `/admin/settings`.

## 4. Mô-đun nguồn cần dùng khi mở rộng

```text
src/services/        Client API theo resource; dùng axiosClient, không gọi Axios rời rạc.
src/types/index.ts   Type API/domain dùng chung; cập nhật cùng lúc với API contract.
src/components/ui/   Button, Input, Modal, Toast, Pagination, Spinner, EmptyState, Badge, StarRating.
src/components/*/    Component theo domain: address, auth, brand, category, certification, payment, product.
src/pages/           Màn hình route-level; `pages/admin/` là khu vực quản trị.
src/providers/       AuthProvider và hook `useAuth`.
src/context/         CartContext và ToastContext.
```

Khi thêm tính năng: cập nhật service, TypeScript type, route/guard (nếu cần), page/component và API spec cùng một thay đổi. Không sao chép interceptor refresh token vào từng service.

## 5. Giới hạn hiện tại đã xác minh

- Không có UI/API để cấp hoặc thu hồi role `MANAGER`; Admin chỉ đổi `isActive` của user.
- Settings UI/API hiện quản lý thông tin công khai cửa hàng (`storePhone`, `storeEmail`, `storeAddress`, `mapEmbedUrl`), không quản lý secret VNPay, SePay, SMTP hay OAuth.
- Không có test runner frontend được khai báo trong `package.json`; hiện có `npm run build` và `npm run lint` để kiểm tra build/lint.
- `locationApi.ts` gọi dịch vụ địa giới bên ngoài; đây không phải API Spring Boot của EcoMart.
- Email OTP do backend gửi qua Gmail SMTP. Khi thiếu cấu hình SMTP ở dev, OTP được ghi log thay vì gửi email thật.

## 6. Kiểm tra trước khi bàn giao thay đổi frontend

1. Chạy `npm run build` trong `ecomart-frontend`.
2. Chạy `npm run lint` trong `ecomart-frontend`.
3. Nếu thay đổi API, kiểm tra backend test liên quan bằng `ecomart-backend\\mvnw.cmd test` hoặc bộ test hẹp phù hợp.
4. Kiểm tra trực tiếp luồng role bị ảnh hưởng: Guest, Customer, Manager hoặc Admin.
