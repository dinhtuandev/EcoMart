# API Rules & Specifications

## 1. Quy chuẩn Đặt tên Endpoint (RESTful Conventions)
- Sử dụng danh từ số nhiều cho tài nguyên (`/api/v1/products`, `/api/v1/categories`, `/api/v1/orders`).
- Chữ thường, phân cách từ bằng dấu gạch ngang `kebab-case` nếu có nhiều từ.
- Prefix toàn bộ API backend với `/api/v1/`.

### Danh sách Endpoint Mẫu:

> ⚠️ Đây chỉ là các ví dụ tiêu biểu. Danh sách endpoint đầy đủ, chính xác (bao gồm toàn bộ Admin API) nằm ở `05_EcoMart_API_Specification.md` — luôn tra file đó trước khi tạo endpoint mới, không tự suy diễn path.

- `POST /api/v1/auth/register`: Đăng ký tài khoản
- `POST /api/v1/auth/login`: Đăng nhập lấy JWT Token
- `GET  /api/v1/me`: Lấy hồ sơ Customer hiện tại (không nằm dưới `/auth`)
- `GET  /api/v1/products`: Lấy danh sách sản phẩm (Hỗ trợ query: `page`, `pageSize`, `keyword`, `categoryId`, `brandId`, `minPrice`, `maxPrice`, `sort` — nhận `priceAsc`/`priceDesc`/`newest`)
- `GET  /api/v1/products/{productId}`: Chi tiết sản phẩm
- `POST /api/v1/orders`: Đặt hàng (Customer)
- `GET  /api/v1/orders?status=PENDING`: Đơn hàng của Customer đang đăng nhập (không có sub-path `/my-orders`, lọc qua query `status` tùy chọn)
- `POST /api/v1/orders/{orderId}/cancel`: Customer hủy đơn (chỉ khi `PENDING`) — dùng **POST**, không phải PUT; body rỗng `{}`, backend tự gán `cancellationReason` mặc định
- `GET  /api/v1/admin/orders`: Quản lý toàn bộ đơn hàng (Admin)
- `POST /api/v1/admin/orders/{orderId}/confirm`: Admin xác nhận đơn `PENDING` → `CONFIRMED`
- `POST /api/v1/admin/orders/{orderId}/cancel`: Admin hủy đơn `PENDING`/`CONFIRMED` → `CANCELLED` (bắt buộc `cancellationReason` trong body)
- `POST /api/v1/admin/orders/{orderId}/complete`: Admin hoàn thành đơn `CONFIRMED` → `COMPLETED`

Ba endpoint hành động Admin (`/confirm`, `/cancel`, `/complete`) được tách riêng thay vì gộp thành 1 endpoint `PUT .../status` chung, để mỗi endpoint tự validate đúng trạng thái nguồn/đích hợp lệ của riêng nó thay vì phải tự dựng state machine trong 1 handler.

## 2. Quy chuẩn Format JSON Trả về (Standard Response Envelope)
Tất cả các API response thành công phải trả về cấu trúc thống nhất:

```json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": { ... }
}
```

Đối với trường hợp lỗi — `errors` là **object** dạng `field -> message`, không phải mảng:

```json
{
  "success": false,
  "message": "Thông tin đầu vào không hợp lệ",
  "errors": {
    "email": "Email không đúng định dạng"
  }
}
```

Không có field `timestamp` trong cả 2 trường hợp — đúng theo `05_EcoMart_API_Specification.md` mục 2.2/2.3.

## 3. HTTP Status Codes
- `200 OK`: Truy vấn hoặc cập nhật thành công.
- `201 Created`: Tạo mới tài nguyên thành công (Đăng ký, Đặt hàng, Tạo sản phẩm).
- `400 Bad Request`: Dữ liệu gửi lên sai định dạng hoặc vi phạm validation.
- `401 Unauthorized`: Chưa đăng nhập hoặc Token hết hạn/không hợp lệ.
- `403 Forbidden`: Đã đăng nhập nhưng không có quyền truy cập (Ví dụ: User thường cố gọi API Admin).
- `404 Not Found`: Không tìm thấy tài nguyên (Sản phẩm không tồn tại, Đơn hàng không tồn tại).
- `500 Internal Server Error`: Lỗi hệ thống Backend không mong muốn.

## 4. Bean Validation
Mọi Request DTO bắt buộc sử dụng annotation validation:
- `@NotNull`, `@NotBlank`, `@Email`, `@Min(0)`, `@Size(min = 6, max = 50)`.
- Backend tự động kiểm tra và trả về lỗi `400 Bad Request` nếu dữ liệu không hợp lệ.
