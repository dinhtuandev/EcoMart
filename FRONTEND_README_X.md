# 🛒 EcoMart Frontend

SPA **React 18 + Vite + TypeScript + TailwindCSS** — giao diện khách hàng & dashboard quản trị của sàn TMĐT xanh [EcoMart](../README.md).

## 🚀 Khởi chạy

```powershell
npm install
npm run dev        # http://localhost:5173
```

- Copy `.env` (hoặc để trống) — biến `VITE_API_BASE_URL` trỏ về backend; nếu bỏ trống, `src/lib/axiosClient.ts` tự fallback về `http://localhost:8081/api/v1`.
- Build production: `npm run build` → xuất ra `dist/`.

## 📁 Cấu trúc thư mục

```text
ecomart-frontend/
├── package.json                              # Khai báo thư viện npm (React, Axios, Tailwind…) & scripts
├── vite.config.ts                            # Cấu hình build Vite (port 5173, alias @ → src/)
├── tailwind.config.js                        # Cấu hình theme giao diện (màu xanh Eco, font Inter…)
├── index.html                                # HTML khung gốc duy nhất, nạp React App vào #root
├── public/                                   # Tài nguyên tĩnh phục vụ trực tiếp
│   └── favicon.svg                           # Favicon lá xanh EcoMart
│
├── src/                                      # MÃ NGUỒN CHÍNH CỦA FRONTEND
│   ├── main.tsx                              # Điểm khởi chạy gốc (nạp ./assets/css/index.css)
│   ├── App.tsx                               # Component gốc tổng (bọc Provider + Router)
│   │
│   ├── assets/                               # QUẢN LÝ TÀI NGUYÊN TĨNH
│   │   ├── css/
│   │   │   └── index.css                     # CSS duy nhất (import Tailwind layers dùng chung)
│   │   ├── images/                           # Hình ảnh dự án (logo, banner, eco-badge…)
│   │   └── fonts/                            # Font chữ hệ thống (đang dùng Inter từ Google Fonts)
│   │
│   ├── pages/                                # MÀN HÌNH GIAO DIỆN (component cấp route)
│   │   ├── admin/                            # Dashboard quản trị: sản phẩm, tồn kho, đơn hàng,
│   │   │                                     #   người dùng, đánh giá, cài đặt, báo cáo…
│   │   ├── HomePage.tsx                      # Trang chủ (banner, sản phẩm xanh nổi bật, eco-score)
│   │   ├── ProductListPage.tsx               # Danh sách sản phẩm (bộ lọc chứng nhận, tìm kiếm)
│   │   ├── ProductDetailPage.tsx             # Chi tiết sản phẩm & đánh giá theo Eco-Score
│   │   ├── CartPage.tsx                      # Giỏ hàng trực tuyến
│   │   ├── CheckoutPage.tsx                  # Thanh toán (COD, VNPay Sandbox, SePay VietQR)
│   │   ├── LoginPage.tsx / RegisterPage.tsx  # Đăng nhập & đăng ký xác thực OTP qua email
│   │   ├── ForgotPasswordPage.tsx            # Quên mật khẩu (gửi OTP đặt lại)
│   │   ├── ProfilePage.tsx                   # Trang cá nhân (thông tin, sổ địa chỉ giao hàng)
│   │   ├── OrderHistoryPage.tsx              # Lịch sử đơn hàng của khách
│   │   └── VNPayMockPage.tsx                 # Mô phỏng cổng VNPay sandbox khi chạy local
│   │
│   ├── components/                           # THÀNH PHẦN UI TÁI SỬ DỤNG (nhóm theo domain)
│   │   ├── common/… → gộp vào ui/            # (đã hợp nhất — xem ui/)
│   │   ├── layout/                           # Khung layout trang (MainLayout, AdminLayout, Header…)
│   │   ├── product/                          # Component sản phẩm (ProductCard, EcoScoreBadge…)
│   │   ├── payment/                          # Component thanh toán (VietQrModal…)
│   │   ├── address/ · auth/ · brand/ ·       # Component theo tính năng:
│   │   ├── category/ · certification/        #   AddressModal, OtpInput, BrandModal…
│   │   └── ui/                               # Nền tảng UI gốc (Button, Input, Modal, Toast,
│   │                                         #   Badge, Pagination, Spinner)
│   │
│   ├── services/                             # MODULE GỌI API (Axios → Spring Boot Backend)
│   │   ├── authApi.ts                        # Đăng ký, đăng nhập, OTP, refresh token
│   │   ├── productApi.ts                     # Sản phẩm, lọc nhãn xanh, danh mục, thương hiệu…
│   │   ├── orderApi.ts / paymentApi.ts       # Tạo đơn, COD/VNPay/SePay, webhook return
│   │   └── axiosClient.ts (ở lib/)           # Instance Axios chung + queue refresh-token 401
│   │
│   ├── context/                              # QUẢN LÝ TRẠNG THÁI TOÀN CỤC (Global State)
│   │   ├── CartContext.tsx                   # Trạng thái giỏ hàng (số lượng, thêm/xóa/sync server)
│   │   └── ToastContext.tsx                  # Hệ thống thông báo toast toàn ứng dụng
│   │
│   ├── providers/
│   │   └── AuthProvider.tsx                  # State xác thực (user + JWT, useReducer):
│   │                                         #   login/logout/updateUser + silent refresh
│   │
│   ├── routes/                               # ĐIỀU HƯỚNG & BẢO VỆ ĐƯỜNG DẪN (Routing)
│   │   ├── AppRoutes.tsx                     # Định nghĩa URL (/cart, /checkout, /admin…)
│   │   └── ProtectedRoute.tsx                # Chặn user chưa đăng nhập/không phải Admin
│   │
│   ├── hooks/                                # Custom hook lấy dữ liệu public
│   │   └── usePublicBrands.ts …              # Thương hiệu, danh mục, chứng nhận cho trang chủ
│   │
│   ├── lib/                                  # Thiết lập hạ tầng client
│   │   └── axiosClient.ts                    # BaseURL, interceptor gắn JWT, tự refresh khi 401
│   │
│   ├── types/                                # ĐỊNH NGHĨA DỮ LIỆU TYPESCRIPT (tương đương DTO backend)
│   │   └── index.ts                          # Toàn bộ type/interface: Product, Order, Cart,
│   │                                         #   AuthResponse, ApiResponse…
│   │
│   └── utils/                                # Tiện ích dùng chung
│       ├── constants.ts                      # Hằng số cấu hình
│       └── formatters.ts                     # Format tiền tệ (VND), ngày tháng…
```

## 📌 Khác biệt so với template gốc

| Template | Thực tế dự án | Lý do |
|---|---|---|
| `services/authService.ts` | `services/authApi.ts` | Đặt tên thống nhất `*Api.ts` cho cả 17 module |
| `context/AuthContext.tsx` | `providers/AuthProvider.tsx` | Auth state phức tạp (useReducer + silent refresh) → tách riêng; `context/` chỉ còn state đơn giản |
| `types/product.ts`, `types/order.ts` | `types/index.ts` gộp một file | Dự án vừa tầm (~40 type), dễ import `from '../types'`; tách file khi phình to |
| `components/common/` riêng | Gộp vào `components/ui/` | Tránh trùng lặp — tất cả primitive nằm cùng một chỗ |

## 🐳 Docker

```powershell
# Từ thư mục gốc repo
docker compose up -d --build frontend   # Chạy tại http://localhost:3000
```

Build multi-stage: Node build → Nginx serve `dist/`, kèm proxy `/api/` → `backend:8081` (xem [`nginx.conf`](nginx.conf)). Cấu hình deploy Vercel xem [`vercel.json`](vercel.json) và phần Deployment ở README gốc.
