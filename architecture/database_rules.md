# Database Rules (PostgreSQL / SQL Server)

## 1. Quy chuẩn Đặt tên (Naming Conventions)

- **Tên bảng**: Số nhiều, chữ thường, phân cách bằng dấu gạch dưới `snake_case` (ví dụ: `users`, `categories`, `products`, `orders`, `order_items`, `payment_transactions`).
- **Tên cột**: Chữ thường `snake_case` (ví dụ: `full_name`, `created_at`, `category_id`, `is_email_verified`).
- **Khóa chính (PK)**: Cột `id` kiểu `BIGINT` / `Long` auto-increment.
- **Khóa ngoại (FK)**: Tên entity số ít + `_id` (ví dụ: `user_id`, `product_id`, `order_id`).

## 2. Danh sách Bảng Cốt lõi & Quan hệ

> ⚠️ Nguồn sự thật duy nhất cho schema là các JPA Entities trong `ecomart-backend/src/main/java/com/ecomart/entity/` và DDL trong `ecomart-database/`. Bảng dưới đây chỉ là bản tóm tắt — nếu có sai khác, **luôn ưu tiên source code**, không suy diễn hay tự thêm/bớt cột.

1. `roles` (id, name: `CUSTOMER` | `ADMIN`, description)
2. `users` (id, role_id FK, full_name, email UNIQUE, password_hash, phone_number, is_active, **is_email_verified**, created_at, updated_at)
3. `email_verification_tokens` (id, email, otp_code, expires_at, is_used, failed_attempts, created_at) — OTP 6 chữ số, hiệu lực 5 phút, max 5 lần thử sai
4. `password_reset_tokens` (id, user_id FK, token UNIQUE, expires_at, is_used, failed_attempts, created_at) — hiệu lực 15 phút, max 5 lần thử sai
5. `addresses` (id, user_id FK, recipient_name, recipient_phone, address_detail, ward, district, province, is_default, created_at, updated_at)
6. `categories` (id, name UNIQUE, description, is_active, created_at, updated_at) → `1:N` với `products`
7. `brands` (id, name UNIQUE, description, is_active, created_at, updated_at) → `1:N` với `products`
8. `certifications` (id, name UNIQUE, description, icon_url, is_active, created_at, updated_at)
9. `products` (id, category_id FK, brand_id FK, name, description, selling_price, original_price, eco_score, material_info, is_visible, created_at, updated_at)
10. `product_images` (id, product_id FK, image_url, is_primary, display_order, created_at) → `1:N` từ `products`
11. `product_certifications` (product_id PK/FK, certification_id PK/FK) — bảng liên kết N-N
12. `inventories` (id, product_id FK UNIQUE, quantity, updated_at) → quan hệ `1:1` với `products`
13. `carts` (id, user_id FK UNIQUE, created_at, updated_at) — mỗi Customer tối đa 1 giỏ hàng
14. `cart_items` (id, cart_id FK, product_id FK, quantity, created_at, updated_at) — `(cart_id, product_id)` UNIQUE
15. `orders` (id, user_id FK, order_code UNIQUE, status ENUM, payment_method ENUM, payment_status ENUM, total_amount, recipient_name, recipient_phone, delivery_address, cancellation_reason, ordered_at, confirmed_at, completed_at, cancelled_at, paid_at)
16. `order_items` (id, order_id FK, product_id FK, product_name, unit_price, quantity, line_total) — snapshot tên/giá tại thời điểm đặt hàng
17. `payment_transactions` (id, order_id FK, payment_ref UNIQUE, gateway ENUM, amount, gateway_transaction_no, status ENUM, raw_response, created_at, updated_at)
18. `reviews` (id, user_id FK, product_id FK, order_item_id FK UNIQUE, rating, comment, is_visible, created_at, updated_at)
19. `contact_messages` (id, full_name, email, phone, subject, content, status ENUM, created_at, resolved_at)
20. `content_pages` (id, slug UNIQUE, title, content, updated_at)
21. `store_settings` (setting_key PK, setting_value, updated_at)

## 3. Enum giá trị cố định

| Enum | Cột | Giá trị |
|---|---|---|
| `OrderStatus` | `orders.status` | `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED` |
| `PaymentMethod` | `orders.payment_method` | `COD`, `VNPAY`, `SEPAY` |
| `PaymentStatus` | `orders.payment_status` | `UNPAID`, `PAID`, `FAILED`, `REFUNDED` |
| `PaymentGateway` | `payment_transactions.gateway` | `VNPAY`, `SEPAY` |
| `TransactionStatus` | `payment_transactions.status` | `PENDING`, `SUCCESS`, `FAILED` |

## 4. Quy tắc Thiết kế Database & Integrity

- **Chuẩn hóa**: Đạt chuẩn **3NF**.
- **Snapshot đơn hàng**: Trong `order_items`, bắt buộc lưu `product_name` và `unit_price` độc lập để tránh biến động sau này làm sai lịch sử đơn hàng.
- **Ràng buộc**: `email` trong `users` là `UNIQUE` (case-insensitive). `selling_price > 0`. `quantity >= 0`. `eco_score` (nếu có) từ 1 đến 5.
- **Trạng thái Đơn hàng** — hệ thống chỉ có **4 trạng thái**:
  - `PENDING`: Chờ xác nhận (Customer có thể hủy)
  - `CONFIRMED`: Đã xác nhận (Admin xác nhận)
  - `COMPLETED`: Đã hoàn thành (Admin cập nhật sau khi giao; tính doanh thu; cho phép review)
  - `CANCELLED`: Đã hủy (bắt buộc có `cancellation_reason`; hoàn tồn kho; Admin hoàn tiền thủ công nếu cần)
  - ❌ Không dùng `SHIPPED`/`DELIVERED` — hệ thống không tích hợp đơn vị vận chuyển.
- **Idempotency webhook**: `payment_transactions` có `UNIQUE(gateway, gateway_transaction_no)` — gọi lại webhook không tạo giao dịch trùng.
- **OTP Security**: `email_verification_tokens.failed_attempts` và `password_reset_tokens.failed_attempts` tự vô hiệu hóa token khi > 5 lần sai.

## 5. Những điều CẤM trong Database

- ❌ Không tạo các bảng quá phức tạp ngoài phạm vi (như `vouchers`, `points`, `warehouses`, `suppliers`).
- ❌ Không xóa cứng dữ liệu quan trọng như User hay Order (dùng `is_active`, `is_visible` hoặc chỉ cập nhật trạng thái).
- ❌ Không bỏ qua đánh Index trên `users.email`, `products.category_id`, `products.brand_id`, `orders.status`, `orders.order_code`.
- ❌ Không bỏ qua constraint `UNIQUE` trên `carts.user_id`, `reviews.order_item_id`, `payment_transactions.payment_ref`.

## 6. Vị trí DDL Schema (Lưu ý tên file bị đặt ngược!)

| Thư mục | File bên trong | Cú pháp thực tế |
|---|---|---|
| `ecomart-database/postgresql/` | `ecomart_schema_sqlserver.sql` | **T-SQL (SQL Server syntax)** |
| `ecomart-database/sqlserver/` | `ecomart_schema_postgresql.sql` | **PostgreSQL 15 syntax** |

→ Để dùng với **PostgreSQL**: chạy file trong thư mục `sqlserver/`.
