# API Specification – EcoMart

## 1. Mục đích và phạm vi

> **Trạng thái tài liệu:** Đã đối chiếu controller, service API và frontend đang có trong source. Cập nhật lần cuối: 08/09/2026. Khi tài liệu và source khác nhau, source code cùng test là nguồn xác thực cuối cùng.

Tài liệu mô tả hợp đồng API REST cho website thương mại điện tử EcoMart. API bao phủ toàn bộ chức năng đã xác định trong Business Analysis, gồm Guest, Customer và Admin. Hệ thống hỗ trợ thanh toán COD, VNPay (sandbox) và SePay.

**Base URL:** `http://localhost:8081/api/v1` (local dev / Docker port 8081)

> Tất cả endpoint trong tài liệu này đã bao gồm prefix `/api/v1/`. Swagger UI chạy tại: `http://localhost:8081/swagger-ui.html`.

**Định dạng dữ liệu:** `application/json; charset=utf-8`

**Quy ước ngày giờ:** ISO 8601, UTC. Ví dụ: `2026-07-30T10:00:00Z`.

## 2. Quy ước chung

### 2.1. Xác thực và phân quyền

Các endpoint có ký hiệu **Customer** hoặc **Admin** yêu cầu gửi access token trong HTTP header:

```http
Authorization: Bearer <access_token>
```

| Vai trò | Quyền truy cập API |
|---|---|
| Guest | Các endpoint công khai và xác thực. |
| Customer | API công khai, dữ liệu tài khoản của chính mình, giỏ hàng, đơn hàng và đánh giá đủ điều kiện. |
| Manager | Các API vận hành: catalog, kho, đơn hàng, review, liên hệ, nội dung và báo cáo. |
| Admin | Toàn bộ quyền của Manager, cùng API quản lý trạng thái tài khoản và cập nhật thông tin cửa hàng. |

### 2.2. Cấu trúc phản hồi thành công

```json
{
  "success": true,
  "message": "Thao tác thành công.",
  "data": {}
}
```

### 2.3. Cấu trúc phản hồi lỗi

```json
{
  "success": false,
  "message": "Dữ liệu gửi lên không hợp lệ.",
  "errors": {
    "email": "Email không đúng định dạng."
  }
}
```

### 2.4. Phân trang

Các API danh sách hỗ trợ các query parameter sau, trừ khi có quy định khác:

| Parameter | Kiểu | Mặc định | Mô tả |
|---|---:|---:|---|
| `page` | Integer | 1 | Trang cần lấy, tối thiểu 1. |
| `pageSize` | Integer | 12 | Số bản ghi trên một trang, từ 1 đến 100. |

Ví dụ phản hồi danh sách:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 12,
      "totalItems": 0,
      "totalPages": 0
    }
  }
}
```

### 2.5. Mã HTTP dùng chung

| Mã | Ý nghĩa |
|---:|---|
| 200 | Lấy dữ liệu hoặc cập nhật thành công. |
| 201 | Tạo mới thành công. |
| 204 | Xóa thành công, không có nội dung trả về. |
| 400 | Request không hợp lệ hoặc vi phạm quy tắc nghiệp vụ. |
| 401 | Chưa xác thực hoặc token không hợp lệ/hết hạn. |
| 403 | Đã xác thực nhưng không có quyền truy cập. |
| 404 | Không tìm thấy tài nguyên. |
| 409 | Dữ liệu bị trùng hoặc xung đột trạng thái. |
| 422 | Dữ liệu hợp lệ về cú pháp nhưng không thỏa điều kiện xử lý, ví dụ không đủ tồn kho. |
| 500 | Lỗi hệ thống không mong muốn. |

### 2.6. Quy ước trạng thái

| Nhóm | Giá trị API | Hiển thị |
|---|---|---|
| Trạng thái đơn hàng | `PENDING` | Chờ xác nhận |
|  | `CONFIRMED` | Đã xác nhận |
|  | `COMPLETED` | Đã hoàn thành |
|  | `CANCELLED` | Đã hủy |
| Phương thức thanh toán | `COD` | Thanh toán khi nhận hàng |
|  | `VNPAY` | Thanh toán qua VNPay |
|  | `SEPAY` | Thanh toán qua SePay |
| Trạng thái thanh toán | `UNPAID` | Chưa thanh toán |
|  | `PAID` | Đã thanh toán |
|  | `FAILED` | Thất bại |
|  | `REFUNDED` | Đã hoàn tiền |
| Trạng thái liên hệ | `NEW` | Mới |
|  | `RESOLVED` | Đã xử lý |

## 3. Mô hình dữ liệu trả về chính

### 3.1. Product

```json
{
  "id": 101,
  "name": "Bình nước inox tái chế",
  "category": { "id": 1, "name": "Đồ gia dụng" },
  "brand": { "id": 2, "name": "EcoLife" },
  "sellingPrice": 199000,
  "originalPrice": 259000,
  "ecoScore": 4,
  "materialInfo": "Inox 304 tái chế 80%, không BPA.",
  "certifications": [
    { "id": 1, "name": "Nhãn xanh Việt Nam", "iconUrl": "https://example.com/icon.png" }
  ],
  "description": "Mô tả sản phẩm.",
  "images": [
    { "id": 1, "url": "https://example.com/image.jpg", "isPrimary": true, "displayOrder": 0 }
  ],
  "quantityInStock": 12,
  "isVisible": true,
  "averageRating": 4.5,
  "reviewCount": 8
}
```

`originalPrice`, `ecoScore`, `materialInfo`, `certifications` có thể là `null`/mảng rỗng nếu Admin chưa nhập. `originalPrice` chỉ hiển thị khi lớn hơn `sellingPrice` (đang khuyến mại).

### 3.2. Order

```json
{
  "id": 1001,
  "orderCode": "EM-20260730-0001",
  "status": "PENDING",
  "statusName": "Chờ xác nhận",
  "paymentMethod": "VNPAY",
  "paymentStatus": "UNPAID",
  "totalAmount": 15990000,
  "shippingAddress": {
    "recipientName": "Nguyễn Văn A",
    "recipientPhone": "0901234567",
    "deliveryAddress": "12 Đường A, Phường B, Quận C, TP. Hồ Chí Minh"
  },
  "items": [
    {
      "id": 5001,
      "productId": 101,
      "productName": "Bình nước inox tái chế",
      "unitPrice": 199000,
      "quantity": 1,
      "lineTotal": 199000,
      "canReview": false
    }
  ],
  "cancellationReason": null,
  "orderedAt": "2026-07-30T10:00:00Z",
  "confirmedAt": null,
  "completedAt": null,
  "cancelledAt": null,
  "paidAt": null
}
```

### 3.3. PaymentTransaction

```json
{
  "id": 9001,
  "orderId": 1001,
  "gateway": "VNPAY",
  "amount": 15990000,
  "gatewayTransactionNo": "14567890",
  "status": "SUCCESS",
  "createdAt": "2026-07-30T10:05:00Z",
  "updatedAt": "2026-07-30T10:06:00Z"
}
```

`rawResponse` (payload gốc từ cổng thanh toán) được lưu ở tầng dữ liệu để audit nhưng không trả về trong API response của Customer; Admin có thể xem trong Order Detail nếu cần debug.

## 4. Authentication API

> Tất cả endpoint bên dưới có đường dẫn đầy đủ là `/api/v1/auth/...` — được khai báo là `PUBLIC` trong `SecurityConfig`, không yêu cầu Bearer token.

| Method | Endpoint | Actor | Mô tả | Thành công |
|---|---|---|---|---:|
| GET | `/api/v1/auth/social-config` | Guest | Lấy Google Client ID/Facebook App ID công khai để khởi tạo SDK đăng nhập. | 200 |
| POST | `/api/v1/auth/register` | Guest | Đăng ký tài khoản Customer mới (gửi OTP kích hoạt qua Gmail SMTP). | 201 |
| POST | `/api/v1/auth/verify-email` | Guest | Xác thực mã OTP 6 chữ số để kích hoạt tài khoản. Trả về Access + Refresh Token. | 200 |
| POST | `/api/v1/auth/resend-verification` | Guest | Gửi lại mã OTP kích hoạt email (Cooldown 60s, Rate Limit 5/15 phút). | 200 |
| POST | `/api/v1/auth/login` | Guest | Đăng nhập bằng email/password. Yêu cầu `isEmailVerified = true` và `isActive = true`. | 200 |
| POST | `/api/v1/auth/social-login` | Guest | Đăng nhập Google/Facebook bằng token do provider cấp. | 200 |
| POST | `/api/v1/auth/refresh-token` | Customer, Admin | Cấp phát Access Token mới từ Refresh Token hợp lệ. | 200 |
| POST | `/api/v1/auth/forgot-password` | Guest | Gửi mã OTP 6 chữ số đặt lại mật khẩu qua email. | 200 |
| POST | `/api/v1/auth/reset-password-otp` | Guest | Đặt mật khẩu mới bằng email + mã OTP 6 chữ số. | 200 |
| POST | `/api/v1/auth/reset-password` | Guest | Đặt mật khẩu mới bằng `token` string + `newPassword`. | 200 |
| GET | `/api/v1/auth/me` | Customer, Admin | Lấy thông tin profile của tài khoản hiện tại từ Bearer Token. | 200 |
| POST | `/api/v1/auth/logout` | Customer, Admin | Đăng xuất phiên hiện tại. | 200 |

### 4.1. Đăng nhập mạng xã hội

`GET /api/v1/auth/social-config` trả về các mã định danh public cần cho frontend tải Google Identity Services hoặc Facebook SDK. Không trả về client secret.

`POST /api/v1/auth/social-login`

```json
{
  "provider": "GOOGLE",
  "token": "id-token-or-access-token-from-provider"
}
```

`provider` nhận `GOOGLE` hoặc `FACEBOOK`. Khi xác thực thành công, response có cùng cấu trúc `AuthResponse` như đăng nhập mật khẩu.

### 4.2. Đăng ký

`POST /api/v1/auth/register`

```json
{
  "fullName": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "password": "MatKhauHopLe123",
  "phoneNumber": "0901234567"
}
```

**Response `201`:**

```json
{
  "success": true,
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để nhận mã xác thực."
}
```

Quy tắc: email phải duy nhất → `409` nếu đã tồn tại. Tài khoản tạo ra ở trạng thái `is_email_verified = false`; chưa đăng nhập được cho đến khi xác thực OTP thành công.

### 4.3. Xác thực Email OTP

`POST /api/v1/auth/verify-email`

```json
{
  "email": "nguyenvana@example.com",
  "otpCode": "482193"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt_access_token>",
    "refreshToken": "<uuid_refresh_token>",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "id": 1,
      "fullName": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "role": "CUSTOMER",
      "isEmailVerified": true
    }
  }
}
```

- OTP có hiệu lực 5 phút.
- Sai mã → tăng `failedAttempts`. Sai đến lần thứ 5 → token bị vô hiệu hóa → `400`.
- OTP hết hạn → `400`. Yêu cầu gửi lại qua `/resend-verification`.

### 4.4. Gửi lại OTP kích hoạt

`POST /api/v1/auth/resend-verification`

```json
{ "email": "nguyenvana@example.com" }
```

- Nếu gọi trước 60s từ lần gửi cuối → `429` với thông báo cooldown còn bao nhiêu giây.
- Nếu vượt 5 lần trong 15 phút → `429`.

### 4.5. Đăng nhập

`POST /api/v1/auth/login`

```json
{
  "email": "nguyenvana@example.com",
  "password": "MatKhauHopLe123"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt_access_token>",
    "refreshToken": "<uuid_refresh_token>",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "id": 1,
      "fullName": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "role": "CUSTOMER",
      "isEmailVerified": true
    }
  }
}
```

- Tài khoản chưa xác thực email (`is_email_verified = false`) → `401` kèm message hướng dẫn xác thực.
- Tài khoản bị khóa (`is_active = false`) → `401`.

### 4.6. Làm mới Access Token (Refresh Token)

`POST /api/v1/auth/refresh-token`

```json
{ "refreshToken": "<uuid_refresh_token>" }
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "accessToken": "<new_jwt_access_token>",
    "refreshToken": "<uuid_refresh_token>",
    "tokenType": "Bearer",
    "expiresIn": 86400
  }
}
```

### 4.7. Quên mật khẩu & Đặt lại mật khẩu

**Bước 1 – Gửi OTP:**

`POST /api/v1/auth/forgot-password`

```json
{ "email": "nguyenvana@example.com" }
```

Anti-spam tương tự `/resend-verification` (Cooldown 60s, Rate Limit 5/15 phút).

**Bước 2a – Đặt lại mật khẩu bằng mã OTP (luồng ưu tiên trên frontend):**

`POST /api/v1/auth/reset-password-otp`

```json
{
  "email": "nguyenvana@example.com",
  "otpCode": "847201",
  "newPassword": "MatKhauMoi123"
}
```

**Bước 2b – Đặt lại mật khẩu bằng token string (luồng dự phòng):**

`POST /api/v1/auth/reset-password`

```json
{
  "token": "<reset_token_string>",
  "newPassword": "MatKhauMoi123"
}
```

OTP đặt lại mật khẩu có hiệu lực 15 phút, tối đa 5 lần nhập sai → token vô hiệu hóa.

### 4.8. Lấy thông tin tài khoản hiện tại

`GET /api/v1/auth/me`  *(yêu cầu `Authorization: Bearer <token>`)*

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "fullName": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phoneNumber": "0901234567",
    "role": "CUSTOMER",
    "isActive": true,
    "isEmailVerified": true,
    "createdAt": "2026-07-01T08:00:00Z"
  }
}
```



## 5. Public Catalog API

> Endpoint công khai — không yêu cầu Bearer token. Có thể xem thêm tại Swagger UI.

| Method | Endpoint | Actor | Mô tả |
|---|---|---|---|
| GET | `/api/v1/categories` | Guest | Lấy danh mục đang hoạt động (`is_active = true`). |
| GET | `/api/v1/brands` | Guest | Lấy thương hiệu đang hoạt động. |
| GET | `/api/v1/certifications` | Guest | Lấy chứng nhận/nhãn xanh đang hoạt động, dùng cho bộ lọc sản phẩm. |
| GET | `/api/v1/products` | Guest | Danh sách sản phẩm đang hiển thị, có tìm kiếm/lọc/phân trang. |
| GET | `/api/v1/products/{productId}` | Guest | Chi tiết một sản phẩm đang hiển thị. |
| GET | `/api/v1/products/{productId}/reviews` | Guest | Danh sách đánh giá đang hiển thị của sản phẩm. |
| GET | `/api/v1/pages` | Guest | Danh sách 3 trang chính sách. |
| GET | `/api/v1/pages/{slug}` | Guest | Nội dung trang chính sách theo `slug` (`return-policy`, `warranty-policy`, `shipping-policy`). |
| GET | `/api/v1/settings` | Guest | Thông tin liên hệ công khai (SĐT, email, địa chỉ, `mapEmbedUrl`). |
| POST | `/api/v1/contact-messages` | Guest | Gửi tin nhắn liên hệ/feedback. |

### 5.1. Danh sách sản phẩm

`GET /products?page=1&pageSize=12&keyword=binh+nuoc&categoryId=1&brandId=2&minPrice=100000&maxPrice=500000&certificationId=1&minEcoScore=3`

| Parameter | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `keyword` | String | Không | Từ khóa tìm trong tên sản phẩm. |
| `categoryId` | Integer | Không | Lọc theo danh mục. |
| `brandId` | Integer | Không | Lọc theo thương hiệu. |
| `certificationId` | Integer | Không | Lọc sản phẩm có gắn chứng nhận này. |
| `minEcoScore` | Integer | Không | Lọc sản phẩm có `ecoScore` lớn hơn hoặc bằng giá trị này (1-5). |
| `minPrice` | Decimal | Không | Giá thấp nhất, lớn hơn hoặc bằng 0. |
| `maxPrice` | Decimal | Không | Giá cao nhất, lớn hơn hoặc bằng `minPrice`. |
| `sort` | String | Không | Một trong: `priceAsc`, `priceDesc`, `newest`. |

Chỉ trả về sản phẩm có `isVisible = true`. Sản phẩm hết hàng vẫn có thể hiển thị nhưng không thể thêm vào giỏ hàng.

### 5.2. Đánh giá công khai

`GET /products/{productId}/reviews?page=1&pageSize=10`

Chỉ trả về review có `isVisible = true`; thông tin phản hồi không bao gồm dữ liệu nhạy cảm của Customer.

### 5.3. Trang chính sách

`GET /pages/{slug}`

```json
{
  "success": true,
  "data": {
    "slug": "return-policy",
    "title": "Chính sách đổi trả",
    "content": "Nội dung...",
    "updatedAt": "2026-07-30T10:00:00Z"
  }
}
```

Trả về `404` nếu `slug` không tồn tại.

### 5.4. Thông tin công khai cửa hàng

`GET /api/v1/settings`

```json
{
  "success": true,
  "data": {
    "storePhone": "0281234567",
    "storeEmail": "contact@ecomart.vn",
    "storeAddress": "12 Đường A, Phường B, Quận C, TP. Hồ Chí Minh",
    "mapEmbedUrl": "https://www.google.com/maps/embed?..."
  }
}
```

Trả về tất cả key-value trong `store_settings`.

### 5.5. Gửi liên hệ

`POST /api/v1/contact-messages`

```json
{
  "fullName": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "phone": "0901234567",
  "subject": "Hỏi về sản phẩm",
  "content": "Sản phẩm X còn hàng không?"
}
```

`fullName`, `email`, `content` bắt buộc. Không yêu cầu đăng nhập; nếu Customer đã đăng nhập, Frontend có thể tự điền `fullName`/`email` từ hồ sơ.



## 6. Customer API

> Tất cả endpoint trong mục này yêu cầu `Authorization: Bearer <token>` với role `CUSTOMER` (hoặc `ADMIN`).

### 6.1. Hồ sơ và mật khẩu

| Method | Endpoint | Mô tả | Thành công |
|---|---|---|---:|
| GET | `/api/v1/me` | Lấy hồ sơ Customer đang đăng nhập. | 200 |
| PATCH | `/api/v1/me` | Cập nhật họ tên hoặc số điện thoại của chính mình. | 200 |
| PATCH | `/api/v1/me/password` | Đổi mật khẩu khi nhập đúng mật khẩu hiện tại. | 200 |

`PATCH /api/v1/me`

```json
{
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0901234567"
}
```

`PATCH /api/v1/me/password`

```json
{
  "currentPassword": "MatKhauCu123",
  "newPassword": "MatKhauMoi123"
}
```

### 6.2. Địa chỉ giao hàng

| Method | Endpoint | Mô tả | Thành công |
|---|---|---|---:|
| GET | `/api/v1/me/addresses` | Lấy danh sách địa chỉ của Customer. | 200 |
| POST | `/api/v1/me/addresses` | Tạo địa chỉ mới. | 201 |
| PATCH | `/api/v1/me/addresses/{addressId}` | Cập nhật địa chỉ thuộc Customer. | 200 |
| DELETE | `/api/v1/me/addresses/{addressId}` | Xóa địa chỉ thuộc Customer. | 204 |

Payload tạo/cập nhật địa chỉ:

```json
{
  "recipientName": "Nguyễn Văn A",
  "recipientPhone": "0901234567",
  "addressDetail": "12 Đường A",
  "ward": "Phường B",
  "district": "Quận C",
  "province": "TP. Hồ Chí Minh",
  "isDefault": true
}
```

Mỗi Customer có tối đa một địa chỉ mặc định. Nếu `isDefault = true`, địa chỉ mặc định trước đó của Customer phải được bỏ cờ mặc định trong cùng giao dịch.

### 6.3. Giỏ hàng

| Method | Endpoint | Mô tả | Thành công |
|---|---|---|---:|
| GET | `/api/v1/cart` | Lấy giỏ hàng hiện tại. | 200 |
| POST | `/api/v1/cart/items` | Thêm sản phẩm vào giỏ hoặc tăng số lượng nếu sản phẩm đã tồn tại. | 200 |
| PATCH | `/api/v1/cart/items/{cartItemId}` | Đặt lại số lượng của một dòng giỏ hàng. | 200 |
| DELETE | `/api/v1/cart/items/{cartItemId}` | Xóa một dòng khỏi giỏ hàng. | 204 |
| DELETE | `/api/v1/cart` | Xóa toàn bộ sản phẩm trong giỏ hàng (Clear cart). | 204 |

`POST /api/v1/cart/items`

```json
{
  "productId": 101,
  "quantity": 1
}
```

`PATCH /api/v1/cart/items/{cartItemId}`

```json
{ "quantity": 2 }
```

Sản phẩm phải đang hiển thị, số lượng phải lớn hơn 0 và không vượt quá tồn kho hiện tại. Nếu không đáp ứng, trả về `422`.

### 6.4. Đặt hàng và lịch sử đơn hàng

| Method | Endpoint | Mô tả | Thành công |
|---|---|---|---:|
| POST | `/api/v1/orders` | Tạo đơn hàng từ giỏ hàng với phương thức COD, VNPay hoặc SePay. | 201 |
| GET | `/api/v1/orders` | Lấy đơn hàng của Customer đang đăng nhập. | 200 |
| GET | `/api/v1/orders/{orderId}` | Lấy chi tiết đơn thuộc Customer. | 200 |
| POST | `/api/v1/orders/{orderId}/cancel` | Hủy đơn thuộc Customer khi đang Chờ xác nhận. | 200 |
| POST | `/api/v1/orders/{orderId}/retry-payment` | Tạo lại giao dịch thanh toán cho đơn online chưa thanh toán/thất bại. | 200 |



`POST /orders`

```json
{
  "addressId": 10,
  "paymentMethod": "VNPAY"
}
```

Response khi `paymentMethod = COD`:

```json
{
  "success": true,
  "data": {
    "order": { "id": 1001, "orderCode": "EM-20260730-0001", "status": "PENDING", "paymentMethod": "COD", "paymentStatus": "UNPAID" },
    "paymentUrl": null
  }
}
```

Response khi `paymentMethod = VNPAY` hoặc `SEPAY`:

```json
{
  "success": true,
  "data": {
    "order": { "id": 1002, "orderCode": "EM-20260730-0002", "status": "PENDING", "paymentMethod": "VNPAY", "paymentStatus": "UNPAID" },
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
  }
}
```

Frontend phải chuyển hướng toàn trang (`window.location.href`) sang `paymentUrl` khi khác `null`.

API phải thực hiện trong một giao dịch:

1. Kiểm tra giỏ hàng không rỗng, Customer hoạt động và địa chỉ thuộc Customer.
2. Khóa các dòng tồn kho của toàn bộ sản phẩm trong giỏ theo thứ tự `productId` tăng dần, rồi kiểm tra lại tồn kho. Dùng `SELECT ... FOR UPDATE` trên PostgreSQL hoặc `UPDLOCK, HOLDLOCK` trên SQL Server; nếu thiếu tồn kho thì rollback và trả `422`.
3. Tạo `ORDER` ở trạng thái `PENDING`, `paymentStatus = UNPAID` và chụp thông tin địa chỉ giao hàng.
4. Tạo các `ORDER_ITEM` với giá tại thời điểm đặt hàng.
5. Giảm tồn kho tương ứng.
6. Xóa các dòng giỏ hàng đã chuyển thành đơn hàng.
7. Nếu `paymentMethod` là `VNPAY`/`SEPAY`: tạo `PAYMENT_TRANSACTION` trạng thái `PENDING`, gọi API cổng thanh toán tương ứng để lấy `paymentUrl` (bước này có thể nằm ngoài transaction DB, nhưng đơn hàng đã tạo phải giữ nguyên nếu bước gọi cổng thất bại — Customer có thể `retry-payment`).

`GET /orders?status=PENDING&page=1&pageSize=10`

`status` là tham số không bắt buộc, nhận một trong bốn trạng thái đơn hàng.

`POST /orders/{orderId}/cancel`

```json
{}
```

Customer không gửi lý do hủy trong phạm vi hiện tại. API phải tự gán `cancellationReason = "Khách hàng hủy đơn"` trong cùng transaction để đáp ứng ràng buộc dữ liệu và lưu vết nghiệp vụ. API chỉ thành công khi đơn thuộc Customer và đang `PENDING`; sau đó trạng thái chuyển sang `CANCELLED`, tồn kho được hoàn lại đúng một lần. Nếu `paymentStatus = PAID`, API chỉ ghi nhận đơn cần hoàn tiền (Admin xử lý thủ công), không tự động gọi API hoàn tiền của cổng thanh toán.

`POST /orders/{orderId}/retry-payment`

Chỉ áp dụng khi đơn đang `PENDING`, `paymentMethod` khác `COD` và `paymentStatus` là `UNPAID` hoặc `FAILED`. Tạo `PAYMENT_TRANSACTION` mới và trả về `paymentUrl` mới, tương tự response của `POST /orders`.

### 6.5. Đánh giá sản phẩm

| Method | Endpoint | Mô tả | Thành công |
|---|---|---|---:|
| POST | `/reviews` | Tạo đánh giá cho `orderItemId` đủ điều kiện. | 201 |
| PATCH | `/reviews/{reviewId}` | Cập nhật nội dung/điểm của review thuộc Customer. | 200 |
| GET | `/me/reviews` | Lấy các đánh giá Customer đã tạo. | 200 |

`POST /reviews`

```json
{
  "orderItemId": 5001,
  "rating": 5,
  "comment": "Sản phẩm hoạt động tốt."
}
```

Hệ thống tự suy ra `productId` từ `orderItemId`. API trả về `422` nếu order item không thuộc đơn `COMPLETED` của Customer hoặc đã có review.

### 6.6. Payment Gateway Webhook API

| Method | Endpoint | Actor | Mô tả |
|---|---|---|---|
| POST | `/payments/vnpay/ipn` | VNPay (server-to-server) | Nhận kết quả giao dịch từ VNPay. |
| POST | `/payments/sepay/webhook` | SePay (server-to-server) | Nhận kết quả giao dịch từ SePay. |
| GET | `/payments/vnpay/return` | Trình duyệt Customer (redirect) | VNPay chuyển hướng trình duyệt về đây; chỉ hiển thị, không xác nhận thanh toán. |
| POST | `/payments/mock/success` | Development only | Giả lập một giao dịch thành công theo `orderId` hoặc `orderCode`; không dùng ở production. |

Các endpoint này **không** dùng `Authorization: Bearer` như API thông thường — xác thực bằng chữ ký/checksum riêng của từng cổng:

- `POST /payments/vnpay/ipn`: xác thực `vnp_SecureHash` (HMAC-SHA512) theo tài liệu VNPay. Sai chữ ký → trả `HTTP 200` với `RspCode` báo lỗi theo đúng quy ước VNPay (VNPay yêu cầu luôn trả `200`, không dùng mã lỗi HTTP để báo trạng thái) và **không** cập nhật dữ liệu.
- `POST /payments/sepay/webhook`: xác thực theo API key/chữ ký của SePay gửi kèm header. Sai xác thực → trả `401`, không cập nhật dữ liệu.
- Cả hai endpoint đều idempotent: gọi lại nhiều lần với cùng `gatewayTransactionNo` không được tạo `PAYMENT_TRANSACTION` trùng hoặc cộng dồn hiệu ứng (ví dụ giảm tồn kho thêm lần nữa).

Xử lý khi xác thực hợp lệ:

1. Tìm `PAYMENT_TRANSACTION`/`ORDER` tương ứng theo mã tham chiếu đơn hàng gửi kèm lúc khởi tạo thanh toán.
2. Đối chiếu số tiền nhận được với `ORDER.totalAmount`; lệch số tiền → ghi nhận `FAILED`, không set `PAID`.
3. Nếu khớp và giao dịch thành công: cập nhật `PAYMENT_TRANSACTION.status = SUCCESS`, `ORDER.paymentStatus = PAID`, `ORDER.paidAt = now()`.
4. Nếu giao dịch thất bại: cập nhật `PAYMENT_TRANSACTION.status = FAILED`; `ORDER.paymentStatus` giữ `UNPAID`.
5. Lưu `rawResponse` để phục vụ audit/debug trên môi trường sandbox.

`GET /payments/vnpay/return?orderId=1002&...`

Endpoint này chỉ redirect Frontend đến `/checkout/result?orderId=1002` (màn hình Payment Result) — không đọc bất kỳ tham số nào từ query string này để quyết định `paymentStatus`; Frontend phải tự gọi `GET /orders/{orderId}` để lấy trạng thái thật.

## 7. Admin và Manager API

> Tất cả endpoint trong mục này yêu cầu `Authorization: Bearer <token>`. Các nhóm catalog, kho, đơn hàng, review, liên hệ, nội dung và báo cáo chấp nhận `ADMIN` hoặc `MANAGER`; chỉ `/admin/users/**` và `/admin/settings/**` yêu cầu `ADMIN`.

### 7.1. Dashboard và Quản lý người dùng

| Method | Endpoint | Mô tả | T### 7.3. Quản lý danh mục và thương hiệu

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/v1/admin/categories` | Danh sách tất cả danh mục, gồm cả danh mục không hoạt động. |
| POST | `/api/v1/admin/categories` | Tạo danh mục. |
| PATCH | `/api/v1/admin/categories/{categoryId}` | Cập nhật tên, mô tả hoặc trạng thái danh mục. |
| GET | `/api/v1/admin/brands` | Danh sách tất cả thương hiệu, gồm cả thương hiệu không hoạt động. |
| POST | `/api/v1/admin/brands` | Tạo thương hiệu. |
| PATCH | `/api/v1/admin/brands/{brandId}` | Cập nhật tên, mô tả hoặc trạng thái thương hiệu. |

Payload danh mục/thương hiệu:

```json
{
  "name": "Túi vải & Ba lô",
  "description": "Túi thân thiện môi trường",
  "isActive": true
}
```

Không có endpoint xóa cứng danh mục hoặc thương hiệu.

### 7.4. Quản lý sản phẩm và tồn kho

| Method | Endpoint | Mô tả | Thành công |
|---|---|---|---:|
| GET | `/api/v1/admin/products` | Danh sách sản phẩm, gồm cả sản phẩm không hiển thị. | 200 |
| POST | `/api/v1/admin/products` | Tạo sản phẩm và bản ghi tồn kho ban đầu. | 201 |
| GET | `/api/v1/admin/products/{productId}` | Lấy chi tiết sản phẩm để quản trị. | 200 |
| PATCH | `/api/v1/admin/products/{productId}` | Cập nhật thông tin sản phẩm. | 200 |
| PUT | `/api/v1/admin/products/{productId}/images` | Thay thế danh sách hình ảnh sản phẩm. | 200 |
| GET | `/api/v1/admin/inventory` | Danh sách tồn kho; hỗ trợ `keyword`, `lowStockOnly`, phân trang. | 200 |
| PATCH | `/api/v1/admin/inventory/{productId}` | Cập nhật số lượng tồn kho. | 200 |

`POST /api/v1/admin/products`

```json
{
  "name": "Bình nước inox tái chế",
  "categoryId": 1,
  "brandId": 2,
  "sellingPrice": 199000,
  "originalPrice": 259000,
  "ecoScore": 4,
  "materialInfo": "Inox 304 tái chế 80%, không BPA.",
  "certificationIds": [1, 3],
  "description": "Mô tả sản phẩm.",
  "isVisible": true,
  "quantityInStock": 10,
  "images": [
    { "url": "https://example.com/image.jpg", "isPrimary": true, "displayOrder": 0 }
  ]
}
```

`originalPrice`, `ecoScore`, `materialInfo`, `certificationIds` đều tùy chọn. `originalPrice` nếu có phải lớn hơn `sellingPrice`; `ecoScore` nếu có là số nguyên 1-5; mọi `id` trong `certificationIds` phải thuộc chứng nhận đang `isActive = true`.

`PATCH /api/v1/admin/inventory/{productId}`

```json
{ "quantityInStock": 25 }
```

`quantityInStock` phải là số nguyên lớn hơn hoặc bằng 0. Sản phẩm đã tồn tại trong đơn hàng không có endpoint xóa cứng; Admin cập nhật `isVisible = false` để ngừng bán.

### 7.5. Quản lý đơn hàng

| Method | Endpoint | Mô tả | Thành công |
|---|---|---|---:|
| GET | `/api/v1/admin/orders` | Danh sách toàn bộ đơn hàng; hỗ trợ `keyword`, `status`, `paymentStatus`, `paymentMethod`, `fromDate`, `toDate`, phân trang. | 200 |
| GET | `/api/v1/admin/orders/{orderId}` | Chi tiết đơn hàng, gồm lịch sử `paymentTransactions`. | 200 |
| POST | `/api/v1/admin/orders/{orderId}/confirm` | Xác nhận đơn `PENDING`. | 200 |
| POST | `/api/v1/admin/orders/{orderId}/cancel` | Hủy đơn `PENDING` hoặc `CONFIRMED`. | 200 |
| POST | `/api/v1/admin/orders/{orderId}/complete` | Hoàn thành đơn `CONFIRMED`. | 200 |
| PATCH | `/api/v1/admin/orders/{orderId}/payment-status` | Cập nhật thủ công trạng thái thanh toán thành `REFUNDED`. | 200 |

`POST /api/v1/admin/orders/{orderId}/cancel`

```json
{ "cancellationReason": "Sản phẩm không còn đủ để giao." }
```

`PATCH /api/v1/admin/orders/{orderId}/payment-status`

```json
{ "paymentStatus": "REFUNDED" }
```

Chỉ chấp nhận chuyển sang `REFUNDED`, chỉ áp dụng cho đơn `CANCELLED` có `paymentMethod` khác `COD` và `paymentStatus` trước đó là `PAID`. Đây là thao tác ghi nhận thủ công, không gọi API hoàn tiền của VNPay/SePay.

Quy tắc xử lý:

| Endpoint | Trạng thái đơn trước | Điều kiện thanh toán | Trạng thái đơn sau | Tác động |
|---|---|---|---|---|
| `/confirm` | `PENDING` | COD, hoặc online `paymentStatus = PAID` | `CONFIRMED` | Lưu `confirmedAt`. |
| `/cancel` | `PENDING`, `CONFIRMED` | Bất kỳ | `CANCELLED` | Bắt buộc lý do; hoàn tồn kho đúng một lần. |
| `/complete` | `CONFIRMED` | Bất kỳ | `COMPLETED` | Lưu `completedAt`; đơn COD auto set `PAID`. Đơn được tính doanh thu. |

Nếu trạng thái hiện tại không phù hợp, hoặc `/confirm` được gọi cho đơn online khi `paymentStatus ≠ PAID`, API trả về `409`.

### 7.6. Quản lý đánh giá

| Method | Endpoint | Mô tả | Thành công |
|---|---|---|---:|
| GET | `/api/v1/admin/reviews` | Danh sách toàn bộ đánh giá; hỗ trợ `productId`, `isVisible`, phân trang. | 200 |
| PATCH | `/api/v1/admin/reviews/{reviewId}/visibility` | Ẩn hoặc hiển thị lại đánh giá. | 200 |

`PATCH /api/v1/admin/reviews/{reviewId}/visibility`

```json
{ "isVisible": false }
```

Ẩn đánh giá chỉ thay đổi trạng thái hiển thị; không xóa review khỏi hệ thống.

y/{productId}` | Cập nhật số lượng tồn kho. | 200 |

`POST /admin/products`

```json
{
  "name": "Bình nước inox tái chế",
  "categoryId": 1,
  "brandId": 2,
  "sellingPrice": 199000,
  "originalPrice": 259000,
  "ecoScore": 4,
  "materialInfo": "Inox 304 tái chế 80%, không BPA.",
  "certificationIds": [1, 3],
  "description": "Mô tả sản phẩm.",
  "isVisible": true,
  "quantityInStock": 10,
  "images": [
    { "url": "https://example.com/image.jpg", "isPrimary": true, "displayOrder": 0 }
  ]
}
```

`originalPrice`, `ecoScore`, `materialInfo`, `certificationIds` đều tùy chọn. `originalPrice` nếu có phải lớn hơn `sellingPrice`; `ecoScore` nếu có là số nguyên 1-5; mọi `id` trong `certificationIds` phải thuộc chứng nhận đang `isActive = true`.

`PATCH /admin/inventory/{productId}`

```json
{ "quantityInStock": 25 }
```

`quantityInStock` phải là số nguyên lớn hơn hoặc bằng 0. Sản phẩm đã tồn tại trong đơn hàng không có endpoint xóa cứng; Admin cập nhật `isVisible = false` để ngừng bán.

### 7.4. Quản lý đơn hàng

| Method | Endpoint | Mô tả | Thành công |
|---|---|---|---:|
| GET | `/admin/orders` | Danh sách toàn bộ đơn hàng; hỗ trợ `keyword`, `status`, `paymentStatus`, `paymentMethod`, `fromDate`, `toDate`, phân trang. | 200 |
| GET | `/admin/orders/{orderId}` | Chi tiết đơn hàng, gồm lịch sử `paymentTransactions`. | 200 |
| POST | `/admin/orders/{orderId}/confirm` | Xác nhận đơn `PENDING`. | 200 |
| POST | `/admin/orders/{orderId}/cancel` | Hủy đơn `PENDING` hoặc `CONFIRMED`. | 200 |
| POST | `/admin/orders/{orderId}/complete` | Hoàn thành đơn `CONFIRMED`. | 200 |
| PATCH | `/admin/orders/{orderId}/payment-status` | Cập nhật thủ công trạng thái thanh toán thành `REFUNDED` sau khi đã hoàn tiền ngoài hệ thống. | 200 |

`POST /admin/orders/{orderId}/cancel`

```json
{ "cancellationReason": "Sản phẩm không còn đủ để giao." }
```

`PATCH /admin/orders/{orderId}/payment-status`

```json
{ "paymentStatus": "REFUNDED" }
```

Chỉ chấp nhận chuyển sang `REFUNDED`, chỉ áp dụng cho đơn `CANCELLED` có `paymentMethod` khác `COD` và `paymentStatus` trước đó là `PAID`. Đây là thao tác ghi nhận thủ công, không gọi API hoàn tiền của VNPay/SePay.

Quy tắc xử lý:

| Endpoint | Trạng thái đơn trước | Điều kiện thanh toán | Trạng thái đơn sau | Tác động |
|---|---|---|---|---|
| `/confirm` | `PENDING` | COD, hoặc online `paymentStatus = PAID` | `CONFIRMED` | Lưu thời điểm xác nhận. |
| `/cancel` | `PENDING`, `CONFIRMED` | Bất kỳ | `CANCELLED` | Bắt buộc lý do; hoàn tồn kho đúng một lần. |
| `/complete` | `CONFIRMED` | Bất kỳ | `COMPLETED` | Lưu thời điểm hoàn thành; đơn được tính doanh thu. |

Nếu trạng thái hiện tại không phù hợp, hoặc `/confirm` được gọi cho đơn online khi `paymentStatus ≠ PAID`, API trả về `409`.

### 7.5. Quản lý đánh giá

| Method | Endpoint | Mô tả | Thành công |
|---|---|---|---:|
| GET | `/admin/reviews` | Danh sách toàn bộ đánh giá; hỗ trợ `productId`, `isVisible`, phân trang. | 200 |
| PATCH | `/admin/reviews/{reviewId}/visibility` | Ẩn hoặc hiển thị lại đánh giá. | 200 |

`PATCH /admin/reviews/{reviewId}/visibility`

```json
{ "isVisible": false }
```

Ẩn đánh giá chỉ thay đổi trạng thái hiển thị; không xóa review khỏi hệ thống.

### 7.7. Quản lý chứng nhận

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/v1/admin/certifications` | Danh sách tất cả chứng nhận, gồm cả không hoạt động. |
| POST | `/api/v1/admin/certifications` | Tạo chứng nhận mới. |
| PATCH | `/api/v1/admin/certifications/{certificationId}` | Cập nhật tên, mô tả, icon hoặc trạng thái. |

Payload:

```json
{
  "name": "Nhãn xanh Việt Nam",
  "description": "Chứng nhận sản phẩm thân thiện môi trường do Bộ TN&MT cấp.",
  "iconUrl": "https://example.com/icon.png",
  "isActive": true
}
```

Không có endpoint xóa cứng chứng nhận.

### 7.8. Quản lý liên hệ

| Method | Endpoint | Mô tả | Thành công |
|---|---|---|---:|
| GET | `/api/v1/admin/contact-messages` | Danh sách tin nhắn liên hệ; hỗ trợ `status`, phân trang. | 200 |
| GET | `/api/v1/admin/contact-messages/{messageId}` | Chi tiết một tin nhắn. | 200 |
| PATCH | `/api/v1/admin/contact-messages/{messageId}/resolve` | Đánh dấu tin nhắn đã xử lý. | 200 |

`PATCH /api/v1/admin/contact-messages/{messageId}/resolve`

```json
{}
```

Chuyển `status` từ `NEW` sang `RESOLVED`, ghi nhận `resolvedAt`. Không có endpoint sửa nội dung hoặc xóa tin nhắn.

### 7.9. Quản lý nội dung trang chính sách

| Method | Endpoint | Mô tả |
|---|---|---|
| PATCH | `/api/v1/admin/pages/{slug}` | Cập nhật tiêu đề/nội dung trang. |

Payload:

```json
{
  "title": "Chính sách đổi trả",
  "content": "Nội dung cập nhật..."
}
```

`slug` cố định theo 3 giá trị đã seed sẵn (`return-policy`, `warranty-policy`, `shipping-policy`); không có endpoint tạo/xóa trang mới trong phạm vi hiện tại.

### 7.10. Cấu hình cửa hàng

| Method | Endpoint | Mô tả |
|---|---|---|
| PATCH | `/api/v1/admin/settings` | Cập nhật một hoặc nhiều key cấu hình. |

Payload:

```json
{
  "storePhone": "0281234567",
  "storeEmail": "contact@ecomart.vn",
  "storeAddress": "12 Đường A, Phường B, Quận C, TP. Hồ Chí Minh",
  "mapEmbedUrl": "https://www.google.com/maps/embed?..."
}
```

Chỉ gửi các key cần cập nhật. Đọc cấu hình cửa hàng thực hiện qua endpoint công khai `GET /api/v1/settings`; controller admin hiện chỉ cung cấp thao tác `PATCH`.




## 8. Bảng ánh xạ Business Rules quan trọng

| Business Rule | API thực thi |
|---|---|
| Email phải duy nhất | `POST /auth/register` trả `409` khi email đã tồn tại. |
| Không đặt hàng khi giỏ trống | `POST /orders` trả `422`. |
| Không mua vượt tồn kho | API giỏ hàng và `POST /orders` kiểm tra tồn kho; bước checkout kiểm tra lại trong giao dịch. |
| 3 phương thức thanh toán | `POST /orders` chỉ nhận `paymentMethod` là `COD`, `VNPAY` hoặc `SEPAY`. |
| Xác thực webhook trước khi cập nhật thanh toán | `POST /payments/vnpay/ipn`, `POST /payments/sepay/webhook` từ chối và không cập nhật dữ liệu nếu chữ ký/checksum sai. |
| Chỉ xác nhận đơn online đã thanh toán | `POST /admin/orders/{orderId}/confirm` trả `409` nếu đơn online có `paymentStatus ≠ PAID`. |
| Customer chỉ hủy đơn chưa xác nhận | `POST /orders/{orderId}/cancel` chỉ chấp nhận `PENDING`. |
| Hủy đơn hoàn tồn kho | Endpoint hủy đơn của Customer/Admin phải hoàn tồn kho trong cùng giao dịch. |
| Hoàn tiền thủ công | `PATCH /admin/orders/{orderId}/payment-status` chỉ ghi nhận `REFUNDED`, không tự gọi API hoàn tiền cổng thanh toán. |
| Chỉ khách đã mua được đánh giá | `POST /reviews` xác thực `orderItemId` thuộc đơn `COMPLETED` của Customer. |
| Admin không xóa đơn hoàn thành | Không cung cấp API xóa đơn hàng. |
| Doanh thu từ đơn hoàn thành | `GET /admin/reports/revenue` chỉ tính `COMPLETED`. |
| Điểm eco 1-5 | `POST`/`PATCH /admin/products` trả `400` nếu `ecoScore` ngoài khoảng 1-5. |
| Giá cũ phải lớn hơn giá bán | `POST`/`PATCH /admin/products` trả `400` nếu `originalPrice ≤ sellingPrice`. |
| Chứng nhận không xóa cứng | Không cung cấp API xóa chứng nhận, chỉ có cập nhật `isActive`. |

## 9. Ví dụ lỗi nghiệp vụ

### 9.1. Không đủ tồn kho

```http
HTTP/1.1 422 Unprocessable Content
```

```json
{
  "success": false,
  "message": "Một hoặc nhiều sản phẩm không đủ tồn kho.",
  "errors": {
    "items": [
      {
        "productId": 101,
        "requestedQuantity": 2,
        "availableQuantity": 1
      }
    ]
  }
}
```

### 9.2. Hủy đơn sai trạng thái

```http
HTTP/1.1 409 Conflict
```

```json
{
  "success": false,
  "message": "Đơn hàng không thể hủy ở trạng thái Đã xác nhận."
}
```

### 9.3. Đánh giá không đủ điều kiện

```http
HTTP/1.1 422 Unprocessable Content
```

```json
{
  "success": false,
  "message": "Chỉ có thể đánh giá sản phẩm trong đơn hàng đã hoàn thành của bạn."
}
```

### 9.4. Xác nhận đơn online chưa thanh toán

```http
HTTP/1.1 409 Conflict
```

```json
{
  "success": false,
  "message": "Không thể xác nhận đơn hàng chưa thanh toán."
}
```

### 9.5. Webhook chữ ký không hợp lệ

```http
HTTP/1.1 200 OK
```

```json
{
  "RspCode": "97",
  "Message": "Invalid signature"
}
```

Lưu ý: theo quy ước của VNPay, endpoint IPN luôn trả `HTTP 200` kèm `RspCode` để báo trạng thái xử lý, không dùng mã lỗi HTTP; endpoint webhook của SePay có thể dùng mã HTTP chuẩn (`401` khi sai xác thực) theo tài liệu SePay.

## 10. Yêu cầu kiểm thử API tối thiểu

1. Guest đăng ký, đăng nhập và không thể truy cập API Customer/Admin khi thiếu token.
2. Customer không thể đọc hoặc thay đổi địa chỉ, giỏ hàng, đơn hàng và review của Customer khác.
3. Checkout thất bại nếu giỏ rỗng, địa chỉ không thuộc Customer hoặc tồn kho không đủ.
4. Checkout thành công tạo đơn `PENDING`, trừ tồn kho và lưu giá/địa chỉ tại thời điểm đặt.
5. Customer chỉ hủy được đơn `PENDING`; Admin hủy được `PENDING` hoặc `CONFIRMED`.
6. Mọi luồng hủy đơn phải hoàn tồn kho đúng một lần.
7. Chỉ Admin được truy cập `/admin/*`.
8. Chỉ đơn `COMPLETED` được tính doanh thu và cho phép tạo review.
9. Sản phẩm, danh mục, thương hiệu có dữ liệu liên quan không thể bị xóa cứng qua API.
10. Webhook thanh toán bị từ chối và không cập nhật dữ liệu khi chữ ký/checksum sai.
11. Gọi lại webhook nhiều lần với cùng `gatewayTransactionNo` không tạo giao dịch trùng hoặc trừ tồn kho thêm lần nữa.
12. Đơn thanh toán online chỉ xác nhận được (`/confirm`) khi `paymentStatus = PAID`; đơn COD không bị ràng buộc này.
13. Hủy đơn đã thanh toán online không tự động gọi API hoàn tiền của cổng; chỉ Admin cập nhật thủ công `REFUNDED`.
14. Filter sản phẩm theo `certificationId`/`minEcoScore` trả đúng tập kết quả; sản phẩm không có `ecoScore` không xuất hiện khi lọc theo `minEcoScore`.
