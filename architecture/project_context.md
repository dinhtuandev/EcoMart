# Project Context: EcoMart E-Commerce

## 1. Giới thiệu Dự án

- **Tên dự án**: EcoMart – Website Thương mại Điện tử B2C Sản phẩm Tiêu dùng Thân thiện Môi trường.
- **Mục tiêu**: Xây dựng hệ thống bán hàng trực tuyến đơn giản, hoàn thiện và chạy ổn định phục vụ đồ án sinh viên.
- **Đối tượng người dùng**:
  - `Guest`: Xem sản phẩm, lọc/tìm kiếm theo danh mục/thương hiệu/giá/chứng nhận/eco-score, đăng ký, đăng nhập.
  - `Customer`: Quản lý giỏ hàng, đặt hàng và thanh toán (COD hoặc online qua VNPay/SePay), theo dõi đơn hàng, đánh giá sản phẩm đã mua.
  - `Admin`: Quản lý danh mục, sản phẩm, tồn kho, đơn hàng, người dùng, nội dung trang, cấu hình cửa hàng và xem 12 báo cáo phân tích chuyên sâu.

## 2. Công nghệ Sử dụng (Tech Stack)

- **Architecture**: Monolithic 3-Tier Architecture (SPA + REST API + Relational DB).
- **Backend Framework**: Java 17 + Spring Boot 3.3.x.
- **Backend Libraries**: Spring Data JPA (Hibernate), Spring Security 6 (Stateless JWT), Lombok, Bean Validation, OpenAPI/Swagger.
- **Frontend Framework**: React 18 + Vite (TypeScript).
- **Frontend Libraries**: React Router DOM v6, Axios, TailwindCSS, Lucide Icons, React Context API (`AuthContext`, `CartContext`, `ToastContext`).
- **Database**: PostgreSQL 15 (production/docker), SQL Server (alternative).
- **Email**: Resend API — OTP xác thực email & đặt lại mật khẩu (6 chữ số, Cooldown 60s, Rate Limit 5/15 phút, Anti-Brute-Force 5 lần thử).
- **Thanh toán**: COD, VNPay Sandbox (HMAC-SHA512 IPN/webhook), SePay VietQR Napas 247 (webhook). Webhook/IPN từ cổng **PHẢI** xác thực chữ ký/checksum phía server trước khi cập nhật trạng thái thanh toán — không tin dữ liệu từ redirect trình duyệt.
- **Container**: Docker Compose (postgres port 5432, backend port 8081, frontend/nginx port 3000).

## 3. Ranh giới Phạm vi & Giới hạn Cấm (Strict Non-Goals)

⚠️ **CẤM AI THỰC HIỆN / KHÔNG ÁP DỤNG TRONG DỰ ÁN NÀY:**

1. ❌ **Không Microservices**: Hệ thống là 1 Backend Monolith duy nhất và 1 Frontend SPA duy nhất.
2. ❌ **Không Clean Architecture phức tạp / DDD / CQRS / Hexagonal**: Không chia layer quá mức, dùng mô hình 3 tầng chuẩn `Controller → Service → Repository → Entity`.
3. ❌ **Không Event-Driven / Message Queue**: Không dùng Kafka, RabbitMQ, ActiveMQ.
4. ❌ **Không tự chế cổng thanh toán / không tích hợp thêm cổng ngoài phạm vi**: Chỉ hỗ trợ **COD**, **VNPay (sandbox)** và **SePay**. Không tích hợp Momo, ZaloPay, Stripe hay cổng khác trong phạm vi đồ án.
5. ❌ **Không Voucher / Mã giảm giá / Tích điểm**: Không làm logic khuyến mãi phức tạp.
6. ❌ **Không AI / Chatbot / Gợi ý sản phẩm nâng cao**.
7. ❌ **Không Đa nhà bán hàng (Multi-vendor / Marketplace)**: Chỉ có 1 gian hàng EcoMart duy nhất do Admin quản lý.
8. ❌ **Không Đa kho / Đa chi nhánh**: Tồn kho quản lý trực tiếp theo từng sản phẩm.
9. ❌ **Không Redux**: Chỉ dùng React Context API.
10. ❌ **Không Next.js**: Frontend dùng React 18 + Vite (SPA thuần), không phải Next.js.

## 4. Nguyên tắc Phát triển chính (Guiding Principles)

- **KISS (Keep It Simple, Stupid)**: Đơn giản hóa giải pháp, ưu tiên code dễ hiểu và triển khai nhanh.
- **YAGNI (You Aren't Gonna Need It)**: Không viết tính năng dư thừa chưa có trong tài liệu nghiệp vụ.
- **Source Code là Source of Truth**: Khi có khác biệt giữa tài liệu và code, **code thắng**. Tài liệu phải được cập nhật để khớp với code, không ngược lại.
- **Nghiêm túc tuân thủ tài liệu trong `docs/`**: Tất cả API, ERD, Use Case phải bám sát tài liệu thiết kế nghiệp vụ của dự án EcoMart.
