# System Context Diagram – EcoMart

## Purpose

Mô tả ranh giới (boundary) của hệ thống EcoMart, các actor bên ngoài tương tác với hệ thống và các hệ thống bên ngoài mà EcoMart tích hợp.

## Source

- BA §1.3 Phạm vi hệ thống, §2.4 Quy trình thanh toán online, §3 Actor
- FR-55…FR-57 (thanh toán online & webhook/IPN), FR-60…62 (OTP qua email)
- BR-19, BR-40, BR-43 (3 phương thức thanh toán; xác thực webhook)
- README Tech Stack; FR-53/54 (Google Maps chỉ nhúng iframe hiển thị)

## Diagram

```mermaid
flowchart TB
    G(["Guest"])
    C(["Customer"])
    A(["Admin"])

    subgraph ECOMART["Hệ thống EcoMart"]
        direction LR
        WEB["Website bán hàng<br/>(Storefront Guest / Customer)"]
        ADMINPORTAL["Khu vực quản trị<br/>/admin/*"]
    end

    subgraph EXT["Hệ thống bên ngoài"]
        direction LR
        RESEND["Resend API<br/>(Gửi email OTP)"]
        VNPAY["VNPay Sandbox<br/>(Cổng thanh toán online)"]
        SEPAY["SePay — VietQR Napas 247<br/>(Webhook giao dịch)"]
        GMAPS["Google Maps Embed<br/>(iframe hiển thị)"]
    end

    G -->|"Xem sản phẩm, tìm kiếm, lọc,<br/>đăng ký / đăng nhập, gửi liên hệ"| WEB
    C -->|"Giỏ hàng, đặt hàng, thanh toán<br/>COD hoặc VNPay / SePay,<br/>theo dõi đơn, hủy đơn, đánh giá"| WEB
    A -->|"Quản lý sản phẩm, tồn kho, danh mục,<br/>thương hiệu, chứng nhận, người dùng,<br/>đơn hàng, thanh toán, báo cáo doanh thu"| ADMINPORTAL

    WEB -->|"Khởi tạo thanh toán online,<br/>nhận paymentUrl"| VNPAY
    VNPAY -->|"IPN server-to-server<br/>xác thực chữ ký HMAC-SHA512"| WEB
    WEB -->|"Tạo URL VietQR theo đơn hàng<br/>(img.vietqr.io)"| SEPAY
    SEPAY -->|"Webhook POST /payments/sepay/webhook<br/>xác thực API Key"| WEB
    WEB -->|"Gửi mã OTP 6 số qua email"| RESEND
    WEB -.->|"Nhúng iframe mapEmbedUrl<br/>(chỉ hiển thị, không tích hợp backend)"| GMAPS
```

### Ghi chú

- EcoMart là **monolith 3 tầng** (React SPA + Spring Boot REST + PostgreSQL), không phải marketplace hay microservice (BA §1.4, CLAUDE.md).
- Hoàn tiền **không** gọi API cổng thanh toán: Admin xử lý thủ công ngoài hệ thống rồi cập nhật trạng thái `REFUNDED` (BR-42, ERD-R-18).
- Google Maps không được gọi từ backend; chỉ nhúng iframe qua `store_settings.mapEmbedUrl` (BA §1.7, FR-53/54).
