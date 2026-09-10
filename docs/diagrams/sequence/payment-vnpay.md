# Sequence Diagram – Thanh toán online qua VNPay Sandbox

## Purpose

Mô tả luồng thanh toán VNPay: redirect sang cổng, nhận IPN server-to-server với xác thực HMAC-SHA512, cập nhật trạng thái thanh toán và xử lý trang kết quả (chỉ hiển thị, không xác nhận).

## Source

- API §6.6 Payment Gateway Webhook API (`/payments/vnpay/ipn`, `/payments/vnpay/return`), §9.5 ví dụ lỗi chữ ký
- docs/02_EcoMart_Diagrams.md §6; FR-56/FR-57
- BR-40/BR-43, NFR-19/20; ERD-R-12, ERD-R-17 (idempotency)
- Wireframe §4.5 Payment Result (không tin query string redirect)

## Diagram

```mermaid
sequenceDiagram
    autonumber
    actor C as Customer
    participant FE as "Frontend SPA (React)"
    participant CTL as "REST Controller /api/v1"
    participant SVC as "Service (Business Logic)"
    participant DB as "PostgreSQL"
    participant GW as "VNPay Sandbox"

    note over SVC,DB: Tiền đề: Order PENDING UNPAID + PaymentTransaction PENDING<br/>đã được tạo ở bước checkout (xem checkout-create-order.md)
    FE-->>C: Redirect toàn trang sang VNPay Payment URL
    C->>GW: Thực hiện thanh toán trên trang của VNPay

    GW->>CTL: POST /payments/vnpay/ipn (server-to-server)
    CTL->>SVC: Xử lý IPN
    SVC->>SVC: Xác thực chữ ký HMAC-SHA512 + vnp_TmnCode,<br/>tra giao dịch theo mã tham chiếu

    alt Sai chữ ký / checksum
        SVC-->>GW: HTTP 200 {RspCode: 97, Invalid Checksum}<br/>không thay đổi bất kỳ dữ liệu nào
    else Đúng chữ ký nhưng giao dịch thất bại hoặc lệch số tiền
        SVC->>DB: PaymentTransaction.status = FAILED<br/>Order giữ paymentStatus = UNPAID
        SVC-->>GW: HTTP 200 RspCode báo thất bại
    else Giao dịch thành công và khớp số tiền
        SVC->>DB: UPDATE PaymentTransaction = SUCCESS<br/>idempotent theo UNIQUE(gateway, gateway_transaction_no)
        SVC->>DB: UPDATE orders SET payment_status = PAID, paid_at = now()
        SVC-->>GW: HTTP 200 {RspCode: 00, Success}
    end

    GW-->>C: Redirect trình duyệt về GET /payments/vnpay/return
    CTL-->>FE: Redirect tới /checkout/result?orderId={orderId}
    note over FE: Trang kết quả chỉ hiển thị thông tin —<br/>không dùng tham số URL để xác nhận thanh toán

    FE->>CTL: GET /orders/{orderId}
    CTL->>SVC: Lấy trạng thái thật của đơn
    SVC->>DB: SELECT orders WHERE id = ?
    DB-->>SVC: Trạng thái hiện tại
    CTL-->>FE: 200 {status, paymentStatus}
    FE-->>C: Hiển thị kết quả theo trạng thái từ API
    note over FE: Nếu paymentStatus vẫn UNPAID do webhook chưa xử lý xong:<br/>hiển thị "Đang xác nhận thanh toán" và tự tải lại sau vài giây
```

## Business Rules áp dụng

| Rule | Ý nghĩa trong luồng |
|---|---|
| BR-40/NFR-19 | `PAID` chỉ khi IPN hợp lệ; không tin dữ liệu từ trình duyệt |
| BR-43 | Chữ ký sai → từ chối, dữ liệu không đổi |
| ERD-R-17 | Webhook gọi lại nhiều lần không tạo giao dịch trùng hay cộng dồn hiệu ứng |
| BR-42 | Nếu đơn PAID bị hủy sau này → hoàn tiền thủ công, xem [order-cancel-refund.md](order-cancel-refund.md) |

> Luồng thất bại: Customer có thể thử lại bằng `POST /orders/{orderId}/retry-payment` khi đơn còn `PENDING` và `paymentStatus ∈ {UNPAID, FAILED}` (API §6.4).
