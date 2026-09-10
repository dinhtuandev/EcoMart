# Sequence Diagram – Thanh toán online qua SePay (VietQR Napas 247)

## Purpose

Mô tả luồng thanh toán SePay: hiển thị modal VietQR, Customer chuyển khoản qua app ngân hàng, SePay gọi webhook về server với xác thực API Key, đối chiếu mã đơn và số tiền trước khi set `PAID`; Frontend polling trạng thái.

## Source

- API §6.6 (`POST /payments/sepay/webhook` — xác thực API key header, idempotent)
- docs/02_EcoMart_Diagrams.md §6; README (SePay VietQR Napas 247)
- Checklist Module 9 (modal QR `img.vietqr.io`, nội dung chuyển khoản `EM-XXXXXXXX`, tự động polling)
- BR-40…BR-43; ERD-R-12, ERD-R-17

## Diagram

```mermaid
sequenceDiagram
    autonumber
    actor C as Customer
    participant FE as "Frontend SPA (React)"
    participant CTL as "REST Controller /api/v1"
    participant SVC as "Service (Business Logic)"
    participant DB as "PostgreSQL"
    participant SP as "SePay"

    note over SVC,DB: Tiền đề: Order PENDING UNPAID + PaymentTransaction PENDING<br/>đã được tạo ở bước checkout
    SVC->>SVC: Tạo URL VietQR Napas 247<br/>(bank, account, amount, orderCode)
    CTL-->>FE: 201 {order, thông tin thanh toán}
    FE-->>C: Mở Modal VietQR kèm mã QR,<br/>số tiền và nội dung chuyển khoản chứa orderCode

    C->>SP: Quét mã QR và chuyển khoản qua App ngân hàng
    SP->>CTL: POST /payments/sepay/webhook (khi tiền vào tài khoản)
    CTL->>SVC: Xử lý webhook
    SVC->>SVC: Xác thực API Key / chữ ký từ Header của SePay

    alt API Key không hợp lệ
        SVC-->>SP: HTTP 401 Unauthorized — từ chối xử lý
    else Nội dung chuyển khoản không chứa orderCode hợp lệ
        SVC-->>SP: HTTP 422 Không tìm thấy mã đơn hàng
    else orderCode hợp lệ
        SVC->>DB: Tra PaymentTransaction PENDING khớp orderCode / paymentRef

        alt Lệch số tiền hoặc không có giao dịch khớp
            SVC-->>SP: Báo lỗi sai lệch số tiền — không set PAID
        else Khớp giao dịch PENDING và đúng số tiền
            SVC->>DB: UPDATE PaymentTransaction = SUCCESS<br/>idempotent theo UNIQUE(gateway, gateway_transaction_no)
            SVC->>DB: UPDATE orders SET payment_status = PAID, paid_at = now()
            SVC-->>SP: HTTP 200 xác nhận đã xử lý
        end
    end

    loop Frontend tự động polling trạng thái thanh toán
        FE->>CTL: GET /orders/{orderId}
        CTL-->>FE: paymentStatus hiện tại
    end

    FE-->>C: Khi PAID: đóng Modal VietQR,<br/>chuyển đến trang Order Detail
```

## Business Rules áp dụng

| Rule | Ý nghĩa trong luồng |
|---|---|
| BR-40/NFR-19 | `PAID` chỉ khi webhook hợp lệ; redirect/modal không phải căn cứ xác nhận |
| BR-41 | Đơn chỉ coi là đã thanh toán khi có ít nhất một giao dịch thành công **khớp đơn hàng và số tiền** |
| BR-43/ERD-R-17 | Webhook sai xác thực bị từ chối; gọi lại không tạo hiệu ứng trùng |
| FR-57/NFR-20 | Secret/API key của SePay chỉ tồn tại phía backend |

> Thất bại/chưa hoàn tất: Customer dùng `POST /orders/{orderId}/retry-payment` để tạo giao dịch mới (API §6.4).
