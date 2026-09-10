# Thiết kế Cơ sở dữ liệu – EcoMart

## 1. Tổng quan

Tài liệu này mô tả cấu trúc cơ sở dữ liệu EcoMart, bao gồm vị trí file DDL, bảng danh sách các bảng dữ liệu, quy tắc naming convention, ràng buộc toàn vẹn và hướng dẫn khởi tạo. Schema được xây dựng trực tiếp từ JPA Entities trong Backend (`ecomart-backend`) và phản ánh trạng thái triển khai thực tế.

---

## 2. Vị trí File DDL Schema

> ⚠️ **Lưu ý quan trọng**: Tên file bên trong mỗi thư mục **đặt ngược** với tên thư mục cha (một lỗi đặt tên lịch sử). Phân biệt theo bảng sau:

| Thư mục | Tên file | Cú pháp thực tế | Hệ quản trị mục tiêu |
|---|---|---|---|
| `ecomart-database/postgresql/` | `ecomart_schema_sqlserver.sql` | **T-SQL (SQL Server)** | ⚠️ Thực ra là file SQL **Server** |
| `ecomart-database/sqlserver/` | `ecomart_schema_postgresql.sql` | **PostgreSQL 15** | ⚠️ Thực ra là file **PostgreSQL** |

**Nguyên tắc sử dụng**:
- Nếu dùng **PostgreSQL** (mặc định docker-compose): Dùng file `ecomart-database/sqlserver/ecomart_schema_postgresql.sql`.
- Nếu dùng **SQL Server**: Dùng file `ecomart-database/postgresql/ecomart_schema_sqlserver.sql`.

Đây là issue trong codebase, **không sửa tên file** – chỉ ghi nhận để tránh nhầm lẫn.

---

## 3. Triển khai thực tế

Hệ thống Backend sử dụng **Spring Data JPA** với **Hibernate**. Schema được quản lý theo 2 cách:

| Môi trường | Cơ chế | Ghi chú |
|---|---|---|
| Development local | `spring.jpa.hibernate.ddl-auto: update` | Hibernate tự cập nhật schema từ JPA Entities. Không cần chạy DDL thủ công. |
| Production / Docker | Chạy file SQL thủ công | Khởi tạo lần đầu bằng DDL file, sau đó dùng migration nếu cần. |

Datasource mặc định trong `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ecomart
    username: postgres
    password: <set via .env>
```

---

## 4. Cấu trúc 21 Bảng Dữ liệu

| STT | Tên bảng | Số cột chính | Ghi chú |
|---|---|---|---|
| 1 | `roles` | 3 | Vai trò hệ thống: `CUSTOMER`, `ADMIN`. |
| 2 | `users` | 10 | Tài khoản người dùng. Có `is_email_verified` (OTP email). |
| 3 | `email_verification_tokens` | 7 | OTP 6 số kích hoạt tài khoản (Resend API). Hạn 5 phút, max 5 lần sai. |
| 4 | `password_reset_tokens` | 7 | OTP/Token đặt lại mật khẩu. Hạn 15 phút, max 5 lần sai. |
| 5 | `addresses` | 10 | Sổ địa chỉ giao hàng. Có `is_default`. |
| 6 | `categories` | 6 | Danh mục sản phẩm. Có `is_active` để ẩn/hiện. |
| 7 | `brands` | 6 | Thương hiệu đối tác. Có `is_active`. |
| 8 | `certifications` | 7 | Chứng nhận/Nhãn xanh sinh thái. Có `icon_url`, `is_active`. |
| 9 | `products` | 12 | Sản phẩm. Có `eco_score` (1-5), `original_price`, `material_info`, `is_visible`. |
| 10 | `product_images` | 6 | Hình ảnh sản phẩm. Có `is_primary`, `display_order`. |
| 11 | `product_certifications` | 2 | Bảng liên kết N-N: Product ↔ Certification. |
| 12 | `inventories` | 4 | Tồn kho: `quantity`, `updated_at`. Quan hệ 1:1 với `products`. |
| 13 | `carts` | 4 | Giỏ hàng của Customer. `user_id` UNIQUE (1 User → 1 Cart). |
| 14 | `cart_items` | 6 | Dòng sản phẩm trong giỏ. `(cart_id, product_id)` UNIQUE. |
| 15 | `orders` | 16 | Đơn hàng với trạng thái, phương thức & trạng thái thanh toán. |
| 16 | `order_items` | 7 | Snapshot sản phẩm trong đơn (tên, giá, SL, thành tiền). |
| 17 | `payment_transactions` | 10 | Lịch sử giao dịch thanh toán online (VNPay/SePay). |
| 18 | `reviews` | 9 | Đánh giá sản phẩm. `order_item_id` UNIQUE FK. |
| 19 | `contact_messages` | 9 | Tin nhắn liên hệ/feedback. |
| 20 | `content_pages` | 5 | Trang chính sách tĩnh (`slug`: `return-policy`, `warranty-policy`, `shipping-policy`). |
| 21 | `store_settings` | 3 | Cấu hình cửa hàng dạng key-value. |

---

## 5. Naming Conventions

| Loại | Quy tắc | Ví dụ |
|---|---|---|
| Tên bảng | Số nhiều, `snake_case` | `users`, `order_items`, `product_certifications` |
| Tên cột | `snake_case` | `full_name`, `is_active`, `created_at` |
| Khóa chính | `id` kiểu `BIGINT` / `SERIAL` | `users.id`, `products.id` |
| Khóa ngoại | `<entity>_id` | `user_id`, `product_id`, `category_id` |
| Enum dạng VARCHAR | Chữ hoa | `CUSTOMER`, `PENDING`, `VNPAY` |
| Composite PK | `(col1, col2)` | `product_certifications(product_id, certification_id)` |

---

## 6. Enum giá trị cố định

| Enum | Bảng sử dụng | Giá trị hợp lệ |
|---|---|---|
| `OrderStatus` | `orders.status` | `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED` |
| `PaymentMethod` | `orders.payment_method` | `COD`, `VNPAY`, `SEPAY` |
| `PaymentStatus` | `orders.payment_status` | `UNPAID`, `PAID`, `FAILED`, `REFUNDED` |
| `PaymentGateway` | `payment_transactions.gateway` | `VNPAY`, `SEPAY` |
| `TransactionStatus` | `payment_transactions.status` | `PENDING`, `SUCCESS`, `FAILED` |
| `ContactMessageStatus` | `contact_messages.status` | `NEW`, `RESOLVED` |

---

## 7. Index quan trọng

| Bảng | Cột được index | Lý do |
|---|---|---|
| `users` | `email` (UNIQUE) | Tìm user theo email khi đăng nhập / đăng ký. |
| `products` | `category_id`, `brand_id` | Lọc sản phẩm theo danh mục / thương hiệu. |
| `products` | `is_visible`, `eco_score` | Lọc sản phẩm đang hiển thị và theo điểm xanh. |
| `orders` | `user_id`, `status`, `payment_status` | Lọc đơn hàng của Customer / Admin. |
| `orders` | `order_code` (UNIQUE) | Tra cứu đơn hàng theo mã. |
| `payment_transactions` | `payment_ref` (UNIQUE) | Kiểm tra idempotency webhook. |
| `reviews` | `product_id`, `order_item_id` (UNIQUE) | Tìm review theo sản phẩm, tránh trùng đánh giá. |
| `email_verification_tokens` | `email`, `expires_at` | Tìm OTP còn hạn theo email. |

---

## 8. Quy tắc Giao dịch (Transaction) ở Tầng ứng dụng

> **Quan trọng**: Một số nghiệp vụ phức tạp yêu cầu toàn bộ các thao tác DB phải thực hiện trong cùng một `@Transactional` để đảm bảo tính nhất quán:

| Nghiệp vụ | Thao tác trong cùng transaction |
|---|---|
| **Tạo đơn hàng** | Kiểm tra tồn kho → Tạo `Order` + `OrderItems` → Giảm `inventories.quantity` → Xóa `CartItems` → Tạo `PaymentTransaction` (nếu online) |
| **Hủy đơn hàng** | Cập nhật `orders.status = CANCELLED` → Hoàn `inventories.quantity` → Lưu `cancellation_reason` |
| **Xử lý webhook thanh toán** | Xác thực chữ ký → Tạo / cập nhật `PaymentTransaction` → Cập nhật `orders.payment_status` và `orders.paid_at` |

---

## 9. Dữ liệu khởi tạo (Seed Data)

File SQL bao gồm INSERT data mẫu để hệ thống chạy ngay sau khi khởi tạo:

| Bảng | Dữ liệu khởi tạo |
|---|---|
| `roles` | 2 vai trò: `CUSTOMER`, `ADMIN` |
| `users` | 1 tài khoản Admin mặc định (`admin@ecomart.vn`, password được hash BCrypt) |
| `categories` | Các danh mục sản phẩm xanh mẫu |
| `brands` | Các thương hiệu đối tác mẫu |
| `certifications` | Các chứng nhận sinh thái mẫu (Nhãn xanh, FSC, Organic...) |
| `content_pages` | 3 trang chính sách: `return-policy`, `warranty-policy`, `shipping-policy` |
| `store_settings` | SĐT, email, địa chỉ cửa hàng và Google Maps embed URL mặc định |

---

## 10. Cách Khởi tạo môi trường Development

### Với Docker Compose (khuyến nghị)

```bash
# Khởi động toàn bộ stack
docker compose up -d

# Backend tự apply DDL qua Hibernate (ddl-auto: update)
# Hoặc chạy file SQL thủ công vào container postgres:
docker exec -i ecomart-db psql -U postgres -d ecomart < ecomart-database/sqlserver/ecomart_schema_postgresql.sql
```

### Không dùng Docker

1. Tạo database PostgreSQL trống tên `ecomart`.
2. Chạy: `psql -U postgres -d ecomart -f ecomart-database/sqlserver/ecomart_schema_postgresql.sql`
3. Cấu hình `.env` với `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.
4. Khởi động Backend: `./mvnw spring-boot:run`

> Xem thêm: [ERD chi tiết](03_EcoMart_ERD.md) | [API Specification](05_EcoMart_API_Specification.md)
